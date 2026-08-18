import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { computeCaseStatus, CASE_STATUS_MAPPING } from '../complaints/case-status.config';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { renderHtmlToPdf } from './pdf-generator';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const FINISHED_STATUS_NAMES = Object.entries(CASE_STATUS_MAPPING)
  .filter(([, status]) => status === 'FINISHED')
  .map(([name]) => name);

export type ReportStatusFilter = 'FINISHED' | 'NOT_FINISHED';
export type ReportSeverityFilter = 'Low' | 'Medium' | 'High';

export interface ReportFilterOptions {
  department?: string;
  village?: string;
  search?: string;
  status?: ReportStatusFilter;
  severity?: ReportSeverityFilter;
}

export interface AchievementComplaint {
  id: string;
  complaintNumber: number;
  subject: string;
  citizenName: string;
  arrivalDate: string;
  finished: boolean;
  severity: string | null;
}

export interface AchievementRow {
  department: string;
  total: number;
  finished: number;
  percentage: number;
  complaints?: AchievementComplaint[];
}

export interface DelayRow {
  department: string;
  overdueCount: number;
  avgDaysOverdue: number;
}

export interface CustomReportComplaint {
  id: string;
  complaintNumber: number;
  statementYear: number;
  arrivalDate: string;
  subject: string;
  citizenName: string;
  citizenVillage: string | null;
  department: string | null;
  examinationStatus: string | null;
  severity: string | null;
}

export interface CustomReportResult {
  complaints: CustomReportComplaint[];
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

const SEVERITY_LABELS: Record<string, string> = {
  Low: 'منخفضة',
  Medium: 'متوسطة',
  High: 'عالية',
};

const CASE_STATUS_LABELS: Record<string, string> = {
  FINISHED: 'منتهي',
  NOT_FINISHED: 'غير منتهي',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  private isFinished(examinationStatusName: string | null): boolean {
    return computeCaseStatus(examinationStatusName) === 'FINISHED';
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

  private buildFilteredWhere(
    options: ReportFilterOptions,
    start: Date,
    end: Date,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {
      arrivalDate: { gte: start, lte: end },
    };
    const AND: Record<string, unknown>[] = [];

    if (options.department) {
      AND.push({ department: { name: options.department } });
    } else if (options.search?.trim()) {
      AND.push({
        department: { name: { contains: options.search.trim(), mode: 'insensitive' } },
      });
    }
    if (options.village) {
      AND.push({ citizen: { village: options.village } });
    }
    if (options.severity) {
      AND.push({ severity: options.severity });
    }
    if (options.status === 'FINISHED') {
      AND.push({ examinationStatus: { name: { in: FINISHED_STATUS_NAMES } } });
    } else if (options.status === 'NOT_FINISHED') {
      AND.push({
        OR: [
          { examinationStatus: { is: null } },
          { examinationStatus: { name: { notIn: FINISHED_STATUS_NAMES } } },
        ],
      });
    }

    if (AND.length > 0) where.AND = AND;
    return where;
  }

  async getAchievementReport(
    department?: string,
    from?: string,
    to?: string,
    village?: string,
    status?: ReportStatusFilter,
    severity?: ReportSeverityFilter,
    search?: string,
    includeComplaints = true,
  ) {
    const { start, end } = this.parseDateRange(from, to);
    // The status filter only narrows the expandable per-department detail rows
    // (fetched lazily). The summary totals/percentages keep the true
    // finished-rate over the whole scope, so selecting "منتهية" doesn't turn
    // every department's percentage into 100%.
    const where = this.buildFilteredWhere(
      { department, village, severity, search },
      start,
      end,
    );

    const complaints = await this.prisma.complaint.findMany({
      where,
      include: { department: true, examinationStatus: true, citizen: true },
    });

    return this.buildAchievementData(complaints, start, end, includeComplaints);
  }

  async getAchievementDepartmentComplaints(
    department: string,
    from?: string,
    to?: string,
    village?: string,
    status?: ReportStatusFilter,
    severity?: ReportSeverityFilter,
    search?: string,
  ) {
    if (!department) {
      throw new BadRequestException('department is required');
    }
    const { start, end } = this.parseDateRange(from, to);
    const where = this.buildFilteredWhere(
      { department, village, status, severity, search },
      start,
      end,
    );

    const complaints = await this.prisma.complaint.findMany({
      where,
      include: { citizen: true, examinationStatus: true },
      orderBy: { arrivalDate: 'desc' },
    });

    return {
      department,
      complaints: complaints.map((c) => ({
        id: c.id,
        complaintNumber: c.complaintNumber,
        subject: c.subject,
        citizenName: c.citizen.fullName,
        arrivalDate: c.arrivalDate.toISOString(),
        finished: this.isFinished(c.examinationStatus?.name ?? null),
        severity: c.severity ?? null,
      })),
    };
  }

  /**
   * Achievement aggregation over an explicit set of complaint ids. Used by
   * the AI summarization agent so it never re-implements the department
   * grouping / finished logic itself.
   */
  async getAchievementForIds(complaintIds: string[]) {
    if (complaintIds.length === 0) return null;

    const complaints = await this.prisma.complaint.findMany({
      where: { id: { in: complaintIds } },
      include: { department: true, examinationStatus: true, citizen: true },
    });

    const now = new Date();
    return this.buildAchievementData(complaints, now, now);
  }

  private buildAchievementData(
    complaints: Array<{
      id: string;
      complaintNumber: number;
      subject: string;
      arrivalDate: Date;
      severity: string | null;
      citizen: { fullName: string };
      department: { name: string } | null;
      examinationStatus: { name: string } | null;
    }>,
    start: Date,
    end: Date,
    includeComplaints = true,
  ) {
    const grouped = new Map<
      string,
      { total: number; finished: number; complaints: AchievementComplaint[] }
    >();
    let govTotal = 0;
    let govFinished = 0;

    for (const c of complaints) {
      const deptName = c.department?.name ?? 'غير محدد';
      if (!grouped.has(deptName)) {
        grouped.set(deptName, { total: 0, finished: 0, complaints: [] });
      }
      const row = grouped.get(deptName)!;
      row.total++;
      govTotal++;
      const finished = this.isFinished(c.examinationStatus?.name ?? null);
      if (finished) {
        row.finished++;
        govFinished++;
      }
      if (includeComplaints) {
        row.complaints.push({
          id: c.id,
          complaintNumber: c.complaintNumber,
          subject: c.subject,
          citizenName: c.citizen.fullName,
          arrivalDate: c.arrivalDate.toISOString(),
          finished,
          severity: c.severity ?? null,
        });
      }
    }

    const departments = Array.from(grouped.entries()).map(([name, r]) => {
      const row: AchievementRow = {
        department: name,
        total: r.total,
        finished: r.finished,
        percentage: r.total > 0 ? Math.round((r.finished / r.total) * 100) : 0,
      };
      if (includeComplaints) row.complaints = r.complaints;
      return row;
    });

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
    village?: string,
    sortBy?: string,
    order?: 'asc' | 'desc',
    status?: ReportStatusFilter,
    severity?: ReportSeverityFilter,
    search?: string,
    includeComplaints = true,
  ) {
    const { start, end } = this.parseDateRange(from, to);
    const now = Date.now();

    const thresholds = await this.settingsService.getDelayThresholds();
    const thresholdDays: Record<string, number> = {
      Low: thresholds.lowDays,
      Medium: thresholds.mediumDays,
      High: thresholds.highDays,
    };
    const maxThresholdDays = Math.max(
      thresholds.lowDays,
      thresholds.mediumDays,
      thresholds.highDays,
    );

    const where = this.buildFilteredWhere(
      { department, village, status, severity, search },
      start,
      end,
    );

    const complaints = await this.prisma.complaint.findMany({
      where,
      include: { department: true, citizen: true, examinationStatus: true },
      orderBy: { arrivalDate: 'desc' },
    });

    const overdueComplaints = complaints.filter((c) => {
      if (this.isFinished(c.examinationStatus?.name ?? null)) return false;
      const days =
        (c.severity && thresholdDays[c.severity]) || thresholds.mediumDays;
      const elapsed = now - c.arrivalDate.getTime();
      return elapsed > days * MS_PER_DAY;
    });

    const grouped = new Map<string, { count: number; totalDays: number }>();
    let totalOverdue = 0;

    for (const c of overdueComplaints) {
      const deptName = c.department?.name ?? 'غير محدد';
      if (!grouped.has(deptName)) {
        grouped.set(deptName, { count: 0, totalDays: 0 });
      }
      const row = grouped.get(deptName)!;
      const days =
        (c.severity && thresholdDays[c.severity]) || thresholds.mediumDays;
      row.count++;
      totalOverdue++;
      row.totalDays += Math.floor(
        (now - c.arrivalDate.getTime() - days * MS_PER_DAY) / MS_PER_DAY,
      );
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

    const result: Record<string, unknown> = {
      period: { from: start.toISOString(), to: end.toISOString() },
      thresholds: {
        Low: thresholds.lowDays,
        Medium: thresholds.mediumDays,
        High: thresholds.highDays,
      },
      overdueThresholdDays: maxThresholdDays,
      totalOverdue,
      departments,
    };
    if (includeComplaints) {
      result.complaints = overdueComplaints.map((c) => ({
        id: c.id,
        complaintNumber: c.complaintNumber,
        arrivalDate: c.arrivalDate.toISOString(),
        citizenName: c.citizen.fullName,
        department: c.department?.name ?? null,
        subject: c.subject,
        severity: c.severity ?? null,
      }));
    }
    return result;
  }

  private async getOverdueComplaints(
    where: Record<string, unknown>,
    thresholds: { lowDays: number; mediumDays: number; highDays: number },
    now: number,
  ) {
    const complaints = await this.prisma.complaint.findMany({
      where,
      include: { department: true, citizen: true, examinationStatus: true },
      orderBy: { arrivalDate: 'desc' },
    });

    const thresholdDays: Record<string, number> = {
      Low: thresholds.lowDays,
      Medium: thresholds.mediumDays,
      High: thresholds.highDays,
    };

    return complaints
      .filter((c) => {
        if (this.isFinished(c.examinationStatus?.name ?? null)) return false;
        const days =
          (c.severity && thresholdDays[c.severity]) || thresholds.mediumDays;
        return now - c.arrivalDate.getTime() > days * MS_PER_DAY;
      })
      .map((c) => ({
        id: c.id,
        complaintNumber: c.complaintNumber,
        arrivalDate: c.arrivalDate.toISOString(),
        citizenName: c.citizen.fullName,
        department: c.department?.name ?? null,
        subject: c.subject,
        severity: c.severity ?? null,
      }));
  }

  async getDelayDepartmentComplaints(
    department: string,
    from?: string,
    to?: string,
    village?: string,
    status?: ReportStatusFilter,
    severity?: ReportSeverityFilter,
    search?: string,
  ) {
    if (!department) {
      throw new BadRequestException('department is required');
    }
    const { start, end } = this.parseDateRange(from, to);
    const now = Date.now();
    const thresholds = await this.settingsService.getDelayThresholds();
    const where = this.buildFilteredWhere(
      { department, village, status, severity, search },
      start,
      end,
    );
    const complaints = await this.getOverdueComplaints(where, thresholds, now);
    return { department, complaints };
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

  async exportCustomReport(
    filters: {
      dateRange?: { from: string; to: string };
      village?: string;
      department?: string;
      examinationStatus?: string;
    },
    format: 'pdf' | 'xlsx',
  ) {
    const result = await this.getCustomReport(filters);

    const dir = path.resolve('uploads', 'reports');
    fs.mkdirSync(dir, { recursive: true });

    const storageKey = `reports/custom-${Date.now()}.${format}`;
    const fullPath = path.resolve('uploads', storageKey);

    let buffer: Buffer;
    let mime: string;

    if (format === 'pdf') {
      const out = await this.generateCustomReportPdf(result, filters);
      buffer = out.buffer;
      mime = out.mime;
    } else {
      const out = await this.generateCustomReportXlsx(result);
      buffer = out.buffer;
      mime = out.mime;
    }

    fs.writeFileSync(fullPath, buffer);

    return {
      downloadUrl: `/uploads/${storageKey}`,
      mime,
      filename: `custom-report.${format}`,
    };
  }

  private async generateCustomReportPdf(
    result: CustomReportResult,
    filters: {
      dateRange?: { from: string; to: string };
      village?: string;
      department?: string;
      examinationStatus?: string;
    },
  ): Promise<{ buffer: Buffer; mime: string }> {
    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('ar-EG');

    const tableRows = result.complaints
      .map(
        (c) => `<tr>
          <td>${c.complaintNumber}-${c.statementYear}</td>
          <td>${escapeHtml(c.citizenName)}</td>
          <td>${escapeHtml(c.citizenVillage ?? '—')}</td>
          <td>${escapeHtml(c.department ?? '—')}</td>
          <td>${escapeHtml(c.examinationStatus ?? '—')}</td>
          <td>${formatDate(c.arrivalDate)}</td>
        </tr>`,
      )
      .join('\n');

    const filtersLabelParts: string[] = [];
    if (filters.dateRange) {
      filtersLabelParts.push(
        `الفترة: من ${new Date(filters.dateRange.from).toLocaleDateString('ar-EG')} إلى ${new Date(filters.dateRange.to).toLocaleDateString('ar-EG')}`,
      );
    }
    if (filters.village) filtersLabelParts.push(`القرية/المركز: ${filters.village}`);
    if (filters.department) filtersLabelParts.push(`الجهة: ${filters.department}`);
    if (filters.examinationStatus)
      filtersLabelParts.push(`حالة الفحص: ${filters.examinationStatus}`);

    const html = replacePlaceholders(readTemplate('report-custom.html'), {
      filtersLabel: filtersLabelParts.length > 0 ? filtersLabelParts.join(' • ') : 'جميع الشكاوى',
      totalRows: String(result.summary.total),
      tableRows,
      generatedDate: new Date().toLocaleDateString('ar-EG'),
    });

    const buffer = await renderHtmlToPdf(html);
    return { buffer, mime: 'application/pdf' };
  }

  private async generateCustomReportXlsx(
    result: CustomReportResult,
  ): Promise<{ buffer: Buffer; mime: string }> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('تقرير مخصص');
    ws.views = [{ rightToLeft: true }];

    const titleCell = ws.getCell('A1');
    titleCell.value = 'تقرير مخصص';
    titleCell.font = { size: 16, bold: true };
    ws.mergeCells('A1:F1');

    ws.getCell('A2').value = 'إجمالي الشكاوى المطابقة';
    ws.getCell('B2').value = result.summary.total;
    ws.mergeCells('A2:A2');

    const headers = ['رقم الشكوى', 'المواطن', 'القرية / المركز', 'الجهة', 'حالة الفحص', 'تاريخ الوصول'];
    headers.forEach((h, i) => {
      ws.getCell(4, i + 1).value = h;
    });

    result.complaints.forEach((c, i) => {
      const r = 5 + i;
      ws.getCell(`A${r}`).value = `${c.complaintNumber}-${c.statementYear}`;
      ws.getCell(`B${r}`).value = c.citizenName;
      ws.getCell(`C${r}`).value = c.citizenVillage ?? '—';
      ws.getCell(`D${r}`).value = c.department ?? '—';
      ws.getCell(`E${r}`).value = c.examinationStatus ?? '—';
      ws.getCell(`F${r}`).value = new Date(c.arrivalDate).toLocaleDateString('ar-EG');
    });

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) => {
      ws.getColumn(col).width = 20;
    });

    const buf = await wb.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buf),
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

  async generateComplaintPdf(complaintId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        citizen: true,
        department: true,
        receptionMethod: true,
        complaintType: true,
        examinationStatus: true,
        presentationStatus: true,
        createdBy: { select: { id: true, username: true, role: true } },
      },
    });

    if (!complaint) throw new NotFoundException('Complaint not found');

    const formatDate = (date: Date | null | undefined) =>
      date ? new Date(date).toLocaleDateString('ar-EG') : '—';

    const responseSection = complaint.authorityResponseText
      ? `
  <div class="section-title">رد الجهة المختصة</div>
  <div class="content-box">${escapeHtml(complaint.authorityResponseText)}</div>
  <table class="ref">
    <tr><td>رقم الرد الوارد:</td><td>${escapeHtml(complaint.incomingResponseNumber || '—')}</td></tr>
    <tr><td>تاريخ الرد:</td><td>${formatDate(complaint.authorityResponseDate)}</td></tr>
  </table>`
      : '';

    const archiveSection = complaint.archiveNumber
      ? `
  <div class="section-title">بيانات الأرشفة</div>
  <table class="ref">
    <tr><td>رقم الأرشيف:</td><td>${escapeHtml(complaint.archiveNumber)}</td></tr>
    <tr><td>تاريخ الأرشفة:</td><td>${formatDate(complaint.archiveDate)}</td></tr>
    <tr><td>موقع الأرشيف:</td><td>${escapeHtml(complaint.archiveLocation || '—')}</td></tr>
  </table>`
      : '';

    const caseStatus = computeCaseStatus(complaint.examinationStatus?.name ?? null);

    const html = replacePlaceholders(readTemplate('complaint.html'), {
      complaintNumber: String(complaint.complaintNumber),
      statementYear: String(complaint.statementYear),
      arrivalDate: formatDate(complaint.arrivalDate),
      severity: SEVERITY_LABELS[complaint.severity] ?? '—',
      department: complaint.department?.name ?? '—',
      complaintType: complaint.complaintType?.name ?? '—',
      receptionMethod: complaint.receptionMethod?.name ?? '—',
      examinationStatus: complaint.examinationStatus?.name ?? '—',
      presentationStatus: complaint.presentationStatus?.name ?? '—',
      caseStatus: CASE_STATUS_LABELS[caseStatus] ?? caseStatus,
      citizenName: escapeHtml(complaint.citizen.fullName),
      citizenNationalId: escapeHtml(complaint.citizen.nationalId || '—'),
      citizenMobile: escapeHtml(complaint.citizen.mobileNumber || '—'),
      citizenAddress: escapeHtml(complaint.citizen.address || '—'),
      citizenVillage: escapeHtml(complaint.citizen.village || '—'),
      citizenDistrict: escapeHtml(complaint.citizen.district || '—'),
      subject: escapeHtml(complaint.subject),
      annotation: escapeHtml(complaint.annotation || 'لا يوجد'),
      responseSection,
      archiveSection,
      respondentName: escapeHtml(complaint.respondentName || '—'),
      createdBy: escapeHtml(complaint.createdBy?.username ?? '—'),
      createdAt: formatDate(complaint.createdAt),
    });

    const buffer = await renderHtmlToPdf(html);

    const dir = path.resolve('uploads', 'complaint-pdfs');
    fs.mkdirSync(dir, { recursive: true });

    const storageKey = `complaint-pdfs/${complaint.id}_${complaint.complaintNumber}_${complaint.statementYear}.pdf`;
    fs.writeFileSync(path.resolve('uploads', storageKey), buffer);

    return {
      downloadUrl: `/uploads/${storageKey}`,
      mime: 'application/pdf',
      filename: `complaint-${complaint.complaintNumber}-${complaint.statementYear}.pdf`,
    };
  }
}
