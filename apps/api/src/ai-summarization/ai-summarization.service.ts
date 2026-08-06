import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { complaintsAgent } from "./mastra.config";

@Injectable()
export class AiSummarizationService {
  private readonly logger = new Logger(AiSummarizationService.name);

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

    const draft = await this.generateDraft(prompt);
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

    const draft = await this.generateDraft(prompt);
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

    const draft = await this.generateDraft(prompt);
    return { draft };
  }

  /**
   * Generate a draft with a rate-limit-aware retry loop and user-facing
   * Arabic error mapping. The framework's own retries are disabled
   * (maxRetries: 0) so only this loop retries — it honors Google's
   * "Please retry in Xs" backoff, which the framework's blind retry cannot.
   */
  private async generateDraft(
    prompt: string,
    retries = 3,
    delayMs = 5000,
  ): Promise<string> {
    let attempt = 0;

    while (attempt < retries) {
      try {
        const response = await complaintsAgent.generate(prompt, {
          modelSettings: { maxRetries: 0 },
        });
        return response.text;
      } catch (error: any) {
        this.logger.error(
          `AI Generation Error (Attempt ${attempt + 1}/${retries}):`,
          error.message,
        );

        const isRateLimit =
          error.status === 429 ||
          error.message?.includes("429") ||
          error.message?.includes("Quota exceeded");

        if (isRateLimit && attempt < retries - 1) {
          attempt++;

          let waitTimeMs = delayMs;
          // Parse Google's exact requested wait time (e.g. "Please retry in 22.3s")
          const match = error.message?.match(/Please retry in (\d+(?:\.\d+)?)s/i);
          if (match && match[1]) {
            waitTimeMs = Math.ceil(parseFloat(match[1])) * 1000 + 1000;
          }

          this.logger.log(`Waiting ${waitTimeMs / 1000}s before retrying...`);
          await this.sleep(waitTimeMs);
          delayMs *= 2;
          continue;
        }

        if (isRateLimit) {
          throw new ServiceUnavailableException(
            "خدمة الذكاء الاصطناعي غير متاحة حالياً بسبب استنفاد رصيد الحساب أو كثرة الطلبات. يرجى الانتظار لبضع ثوانٍ والمحاولة لاحقاً.",
          );
        }
        if (error.status === 403 || error.message?.includes("403")) {
          throw new ServiceUnavailableException(
            "تم رفض الوصول لخدمة الذكاء الاصطناعي. تأكد من تفعيل واجهة برمجة التطبيقات (API) وصلاحيات المفتاح.",
          );
        }

        const isNetworkError =
          error.message?.includes("fetch failed") ||
          error.message?.includes("Connect Timeout") ||
          error.message?.includes("Cannot connect to API") ||
          error.message?.includes("ECONNREFUSED") ||
          error.message?.includes("ETIMEDOUT") ||
          error.cause?.code === "UND_ERR_CONNECT_TIMEOUT";

        if (isNetworkError) {
          throw new ServiceUnavailableException(
            "فشل الاتصال بخدمة الذكاء الاصطناعي بسبب مشكلة في الشبكة أو انتهاء مهلة الاتصال. تأكد من الاتصال بالإنترنت ومن أن الوصول إلى خدمات Google غير محجوب.",
          );
        }

        throw new ServiceUnavailableException(
          "عذراً، حدث خطأ غير متوقع أثناء الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
        );
      }
    }

    throw new ServiceUnavailableException(
      "استنفد النظام جميع محاولات الاتصال بخدمة الذكاء الاصطناعي.",
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
