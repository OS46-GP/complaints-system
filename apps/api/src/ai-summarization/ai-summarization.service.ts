import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { generateDraft } from "./mastra.config";

@Injectable()
export class AiSummarizationService {
  constructor(private readonly prisma: PrismaService) {}

  async summarizeComplaint(complaintId: string): Promise<{ draft: string }> {
    const complaint = await this.prisma.client.complaint.findUnique({
      where: { id: complaintId },
      include: {
        citizen: true,
        department: true,
        examinationStatus: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    const prompt = `
لخّص الشكوى التالية بلغة عربية واضحة وموجزة (فقرة واحدة أو اثنتان):

- رقم الشكوى: ${complaint.complaintNumber} لسنة ${complaint.statementYear}
- المواطن: ${complaint.citizen.fullName}
- القرية/المنطقة: ${complaint.citizen.village ?? "غير محدد"}
- الجهة المختصة: ${complaint.department?.name ?? "غير محددة"}
- موضوع الشكوى: ${complaint.subject}
- حالة الفحص: ${complaint.examinationStatus?.name ?? "قيد الفحص"}
- نتيجة الفحص: ${complaint.examinationResult ?? "لم يتم بعد"}
- ملاحظات: ${complaint.annotation ?? "لا يوجد"}
- تاريخ الورود: ${complaint.arrivalDate.toLocaleDateString("ar-EG")}
    `.trim();

    const draft = await generateDraft(prompt);
    return { draft };
  }

  async draftReport(from: string, to: string): Promise<{ draft: string }> {
    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const complaints = await this.prisma.client.complaint.findMany({
      where: { arrivalDate: { gte: start, lte: end } },
      include: {
        department: true,
        examinationStatus: true,
      },
    });

    const total = complaints.length;

    // Group by department
    const byDept: Record<string, { total: number; finished: number; name: string }> = {};
    for (const c of complaints) {
      const key = c.departmentId ?? "unknown";
      const name = c.department?.name ?? "غير محدد";
      if (!byDept[key]) byDept[key] = { total: 0, finished: 0, name };
      byDept[key].total++;
      // "Finished" examination statuses
      const finishedStatuses = new Set(["تم الفحص", "مستوفي", "Completed", "Resolved", "Finished", "منتهية"]);
      if (finishedStatuses.has(c.examinationStatus?.name ?? "")) {
        byDept[key].finished++;
      }
    }

    const achievementRows = Object.values(byDept).map((d) => ({
      department: d.name,
      total: d.total,
      finished: d.finished,
      percentage: d.total > 0 ? Math.round((d.finished / d.total) * 100) : 0,
    }));

    const totalFinished = achievementRows.reduce((sum, r) => sum + r.finished, 0);

    const periodLabel = `${start.toLocaleDateString("ar-EG")} إلى ${end.toLocaleDateString("ar-EG")}`;

    const prompt = `
صُغ تقريراً دورياً رسمياً باللغة العربية عن شكاوى الفترة من ${periodLabel}.

إجمالي الشكاوى: ${total}
المنجز منها: ${totalFinished}

نسب الإنجاز حسب الجهة:
${achievementRows.map((r) => `- ${r.department}: ${r.finished} من ${r.total} (${r.percentage}%)`).join("\n")}

اكتب التقرير بأسلوب رسمي حكومي مناسب للمراجعة والاعتماد.
    `.trim();

    const draft = await generateDraft(prompt);
    return { draft };
  }

  async draftMemo(complaintId: string): Promise<{ draft: string }> {
    const complaint = await this.prisma.client.complaint.findUnique({
      where: { id: complaintId },
      include: {
        citizen: true,
        department: true,
        examinationStatus: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    const prompt = `
صُغ خطاباً رسمياً (مذكرة) باللغة العربية الفصحى متعلقاً بالشكوى التالية:

- رقم الشكوى: ${complaint.complaintNumber} لسنة ${complaint.statementYear}
- المواطن: ${complaint.citizen.fullName}
- عنوانه: ${complaint.citizen.address ?? ""} - ${complaint.citizen.village ?? ""}
- الجهة المختصة: ${complaint.department?.name ?? "الجهة المختصة"}
- موضوع الشكوى: ${complaint.subject}
- نتيجة الفحص: ${complaint.examinationResult ?? "قيد الدراسة"}
- رقم الخطاب الصادر: ${complaint.outgoingLetterNumber ?? "—"}
- تاريخ اليوم: ${new Date().toLocaleDateString("ar-EG")}
- محافظة: المنوفية

الخطاب موجه من ديوان عام المحافظة إلى ${complaint.department?.name ?? "الجهة المختصة"}.
استخدم صيغة رسمية حكومية مع التحية والختام المناسبين.
    `.trim();

    const draft = await generateDraft(prompt);
    return { draft };
  }
}
