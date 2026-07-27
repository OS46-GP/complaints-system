import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { renderHtmlToPdf } from './pdf-generator';

const OVERDUE_THRESHOLD_DAYS = 30;

const FINISHED_EXAMINATION_STATUSES = new Set([
  'Completed',
  'Resolved',
  'Finished',
  'منتهية',
  'تم الحل',
]);

export interface AchievementRow {
  department: string;
  total: number;
  finished: number;
  percentage: number;
}

export interface DelayRow {
  department: string;
  overdueCount: number;
  avgDaysOverdue: number;
}

export interface CustomReportResult {
  complaints: Array<Record<string, unknown>>;
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
  };
}

type ReportType = 'ACHIEVEMENT' | 'DELAY';

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

function readTemplate(name: string): string {
  return fs.readFileSync(path.join(__dirname, 'templates', name), 'utf-8');
}

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  private isFinished(examinationStatusName: string | null): boolean {
    if (!examinationStatusName) return false;
    return FINISHED_EXAMINATION_STATUSES.has(examinationStatusName);
  }

  private parseDateRange(from?: string, to?: string) {
    const now = new Date();
    const start = from
      ? new Date(from)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  async getAchievementReport(department?: string, from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);
    const where: Record<string, unknown> = {
      arrivalDate: { gte: start, lte: end },
    };
    if (department) {
      where.department = { name: department };
    }

    const complaints = await this.prisma.complaint.findMany({
      where,
      include: { department: true, examinationStatus: true },
    });

    const grouped = new Map<string, AchievementRow>();
    let govTotal = 0;
    let govFinished = 0;

    for (const c of complaints) {
      const deptName = c.department?.name ?? 'غير محدد';
      if (!grouped.has(deptName)) {
        grouped.set(deptName, { department: deptName, total: 0, finished: 0, percentage: 0 });
      }
      const row = grouped.get(deptName)!;
      row.total++;
      govTotal++;
      if (this.isFinished(c.examinationStatus?.name ?? null)) {
        row.finished++;
        govFinished++;
      }
    }

    const departments = Array.from(grouped.values()).map((r) => ({
      ...r,
      percentage: r.total > 0 ? Math.round((r.finished / r.total) * 100) : 0,
    }));

    return {
      period: { from: start.toISOString(), to: end.toISOString() },
      governorateTotal: govTotal,
      governorateFinished: govFinished,
      governorateAchievement:
        govTotal > 0 ? Math.round((govFinished / govTotal) * 100) : 0,
      departments,
    };
  }

  async getDelayReport(
    department?: string,
    from?: string,
    to?: string,
    sortBy?: string,
    order?: 'asc' | 'desc',
  ) {
    const { start, end } = this.parseDateRange(from, to);
    const now = Date.now();
    const thresholdMs = OVERDUE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

    const where: Record<string, unknown> = {
      arrivalDate: { gte: start, lte: end },
    };
    if (department) {
      where.department = { name: department };
    }

    const complaints = await this.prisma.complaint.findMany({
      where,
      include: { department: true, citizen: true, examinationStatus: true },
      orderBy: { arrivalDate: 'desc' },
    });

    const overdueComplaints = complaints.filter((c) => {
      if (this.isFinished(c.examinationStatus?.name ?? null)) return false;
      const elapsed = now - c.arrivalDate.getTime();
      return elapsed > thresholdMs;
    });

    const grouped = new Map<string, { count: number; totalDays: number }>();
    let totalOverdue = 0;

    for (const c of overdueComplaints) {
      const deptName = c.department?.name ?? 'غير محدد';
      if (!grouped.has(deptName)) {
        grouped.set(deptName, { count: 0, totalDays: 0 });
      }
      const row = grouped.get(deptName)!;
      row.count++;
      totalOverdue++;
      row.totalDays += Math.floor((now - c.arrivalDate.getTime() - thresholdMs) / (24 * 60 * 60 * 1000));
    }

    const departments: DelayRow[] = Array.from(grouped.entries()).map(
      ([dept, data]) => ({
        department: dept,
        overdueCount: data.count,
        avgDaysOverdue:
          data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
      }),
    );

    if (sortBy === 'overdueCount' || sortBy === 'avgDaysOverdue') {
      departments.sort((a, b) => {
        const diff = a[sortBy] - b[sortBy];
        return order === 'asc' ? diff : -diff;
      });
    }

    return {
      period: { from: start.toISOString(), to: end.toISOString() },
      overdueThresholdDays: OVERDUE_THRESHOLD_DAYS,
      totalOverdue,
      departments,
      complaints: overdueComplaints.map((c) => ({
        id: c.id,
        complaintNumber: c.complaintNumber,
        arrivalDate: c.arrivalDate.toISOString(),
        citizenName: c.citizen.fullName,
        department: c.department?.name ?? null,
        subject: c.subject,
      })),
    };
  }

  async getCustomReport(filters: {
    dateRange?: { from: string; to: string };
    village?: string;
    department?: string;
    examinationStatus?: string;
  }): Promise<CustomReportResult> {
    const where: Record<string, unknown> = {};

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.from);
      const end = new Date(filters.dateRange.to);
      end.setHours(23, 59, 59, 999);
      where.arrivalDate = { gte: start, lte: end };
    }

    if (filters.village) {
      where.citizen = { village: filters.village };
    }

    if (filters.department) {
      where.department = { name: filters.department };
    }

    if (filters.examinationStatus) {
      where.examinationStatus = { name: filters.examinationStatus };
    }

    const complaints = await this.prisma.complaint.findMany({
      where,
      include: {
        department: true,
        citizen: true,
        examinationStatus: true,
      },
      orderBy: { arrivalDate: 'desc' },
    });

    const byStatus: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};

    const mapped = complaints.map((c) => ({
      id: c.id,
      complaintNumber: c.complaintNumber,
      statementYear: c.statementYear,
      arrivalDate: c.arrivalDate.toISOString(),
      subject: c.subject,
      citizenName: c.citizen.fullName,
      citizenVillage: c.citizen.village,
      department: c.department?.name ?? null,
      examinationStatus: c.examinationStatus?.name ?? null,
      severity: c.severity,
    }));

    for (const c of mapped) {
      const st = c.examinationStatus ?? 'غير محدد';
      byStatus[st] = (byStatus[st] ?? 0) + 1;
      const dept = c.department ?? 'غير محدد';
      byDepartment[dept] = (byDepartment[dept] ?? 0) + 1;
    }

    return {
      complaints: mapped,
      summary: {
        total: complaints.length,
        byStatus,
        byDepartment,
      },
    };
  }

  async generateAndPersistReport(
    type: ReportType,
    from: string,
    to: string,
  ) {
    const { start, end } = this.parseDateRange(from, to);

    let data: unknown;

    if (type === 'ACHIEVEMENT') {
      data = await this.getAchievementReport(undefined, from, to);
    } else {
      data = await this.getDelayReport(undefined, from, to);
    }

    const periodLabel = this.formatPeriodLabel(start, end);

    const report = await this.prisma.generatedReport.create({
      data: {
        type,
        periodLabel,
        periodStart: start,
        periodEnd: end,
        data: data as any,
      },
    });

    return report;
  }

  private formatPeriodLabel(start: Date, end: Date): string {
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const s = start.toLocaleDateString('ar-EG', opts);
    const e = end.toLocaleDateString('ar-EG', opts);
    return `من ${s} إلى ${e}`;
  }

  async getScheduledReports(
    type?: string,
    page = 1,
    limit = 20,
  ) {
    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const [reports, total] = await Promise.all([
      this.prisma.generatedReport.findMany({
        where,
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.generatedReport.count({ where }),
    ]);

    return { reports, total, page, limit };
  }

  async exportReport(id: string, format: 'pdf' | 'xlsx') {
    const report = await this.prisma.generatedReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Report not found');

    const dir = path.resolve('uploads', 'reports');
    fs.mkdirSync(dir, { recursive: true });

    const storageKey = `reports/${report.id}.${format}`;
    const fullPath = path.resolve('uploads', storageKey);

    let buffer: Buffer;
    let mime: string;

    if (format === 'pdf') {
      const out = await this.generateReportPdf(report);
      buffer = out.buffer;
      mime = out.mime;
    } else {
      const out = await this.generateReportXlsx(report);
      buffer = out.buffer;
      mime = out.mime;
    }

    fs.writeFileSync(fullPath, buffer);

    await this.prisma.generatedReport.update({
      where: { id },
      data: { format, storageKey },
    });

    return {
      downloadUrl: `/uploads/${storageKey}`,
      mime,
      filename: `report-${report.type.toLowerCase()}.${format}`,
    };
  }

  private async generateReportPdf(
    report: {
      type: string;
      periodLabel: string;
      data: unknown;
    },
  ): Promise<{ buffer: Buffer; mime: string; filename: string }> {
    const data = report.data as Record<string, unknown>;

    const templateName = report.type === 'ACHIEVEMENT'
      ? 'report-achievement.html'
      : 'report-delay.html';

    const depts = data['departments'] as Array<Record<string, unknown>>;

    const tableRows = report.type === 'ACHIEVEMENT'
      ? (depts as Array<{ department: string; total: number; finished: number; percentage: number }>)
          .map((d) => `<tr><td>${d.department}</td><td>${d.total}</td><td>${d.finished}</td><td>${d.percentage}%</td></tr>`)
          .join('\n')
      : (depts as Array<{ department: string; overdueCount: number; avgDaysOverdue: number }>)
          .map((d) => `<tr><td>${d.department}</td><td>${d.overdueCount}</td><td>${d.avgDaysOverdue}</td></tr>`)
          .join('\n');

    const html = replacePlaceholders(readTemplate(templateName), {
      periodLabel: report.periodLabel,
      governorateTotal: String(data['governorateTotal'] ?? ''),
      governorateFinished: String(data['governorateFinished'] ?? ''),
      governorateAchievement: String(data['governorateAchievement'] ?? ''),
      totalOverdue: String(data['totalOverdue'] ?? ''),
      overdueThresholdDays: String(data['overdueThresholdDays'] ?? ''),
      tableRows,
      generatedDate: new Date().toLocaleDateString('ar-EG'),
    });

    const buffer = await renderHtmlToPdf(html);
    return { buffer, mime: 'application/pdf', filename: `report-${report.type.toLowerCase()}.pdf` };
  }


  private async generateReportXlsx(
    report: {
      type: string;
      periodLabel: string;
      data: unknown;
    },
  ): Promise<{ buffer: Buffer; mime: string; filename: string }> {
    const data = report.data as Record<string, unknown>;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('تقرير');

    ws.views = [{ rightToLeft: true }];

    const titleCell = ws.getCell('A1');
    titleCell.value =
      report.type === 'ACHIEVEMENT' ? 'تقرير نسبة الإنجاز' : 'تقرير المتأخرات';
    titleCell.font = { size: 16, bold: true };
    ws.mergeCells('A1:D1');

    ws.getCell('A2').value = report.periodLabel;
    ws.getCell('A2').font = { size: 12, italic: true };
    ws.mergeCells('A2:D2');

    if (report.type === 'ACHIEVEMENT') {
      ws.getCell('A4').value = 'الجهة';
      ws.getCell('B4').value = 'الإجمالي';
      ws.getCell('C4').value = 'المنتهية';
      ws.getCell('D4').value = 'نسبة الإنجاز';

      const depts = data['departments'] as Array<{
        department: string;
        total: number;
        finished: number;
        percentage: number;
      }>;
      depts.forEach((d, i) => {
        const r = 5 + i;
        ws.getCell(`A${r}`).value = d.department;
        ws.getCell(`B${r}`).value = d.total;
        ws.getCell(`C${r}`).value = d.finished;
        ws.getCell(`D${r}`).value = `${d.percentage}%`;
      });
    } else {
      ws.getCell('A4').value = 'الجهة';
      ws.getCell('B4').value = 'عدد المتأخر';
      ws.getCell('C4').value = 'متوسط أيام التأخير';

      const depts = data['departments'] as Array<{
        department: string;
        overdueCount: number;
        avgDaysOverdue: number;
      }>;
      depts.forEach((d, i) => {
        const r = 5 + i;
        ws.getCell(`A${r}`).value = d.department;
        ws.getCell(`B${r}`).value = d.overdueCount;
        ws.getCell(`C${r}`).value = d.avgDaysOverdue;
      });
    }

    ['A', 'B', 'C', 'D'].forEach((col) => {
      ws.getColumn(col).width = 25;
    });

    const buf = await wb.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buf),
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `report-${report.type.toLowerCase()}.xlsx`,
    };
  }

  async generateMemo(complaintId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        citizen: true,
        department: true,
      },
    });

    if (!complaint) throw new NotFoundException('Complaint not found');

    const html = replacePlaceholders(readTemplate('memo.html'), {
      complaintNumber: String(complaint.complaintNumber),
      arrivalDate: complaint.arrivalDate.toLocaleDateString('ar-EG'),
      citizenName: complaint.citizen.fullName,
      department: complaint.department?.name ?? 'غير محدد',
      subject: complaint.subject,
      departmentOfficial: `السيد/ مدير ${complaint.department?.name ?? 'الجهة المختصة'}`,
      responseDays: '15',
      generatedDate: new Date().toLocaleDateString('ar-EG'),
    });

    // NOTE (BE-3): The letterhead, greeting, signatory, and response-days
    // values above are PLACEHOLDERS pending stakeholder confirmation of the
    // official Menofia Governorate memo format.

    const buffer = await renderHtmlToPdf(html);

    const dir = path.resolve('uploads', 'memos');
    fs.mkdirSync(dir, { recursive: true });

    const storageKey = `memos/${complaint.id}_${complaint.complaintNumber}.pdf`;
    const fullPath = path.resolve('uploads', storageKey);
    fs.writeFileSync(fullPath, buffer);

    return {
      downloadUrl: `/uploads/${storageKey}`,
      mime: 'application/pdf',
      filename: `memo-${complaint.complaintNumber}.pdf`,
    };
  }
}
