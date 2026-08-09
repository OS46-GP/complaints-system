import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ReportingService } from "../reporting/reporting.service";
import { ENABLE_AI, getOrCreateAgent } from "./mastra.config";

interface SummaryComplaint {
  complaintNumber: number;
  statementYear: number;
  subject: string;
  arrivalDate: Date;
  examinationResult: string | null;
  annotation: string | null;
  citizen: { fullName: string; village: string | null };
  department: { name: string } | null;
  examinationStatus: { name: string } | null;
}

@Injectable()
export class AiSummarizationService {
  private readonly logger = new Logger(AiSummarizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportingService: ReportingService,
  ) {}

  async summarizeComplaint(complaintId: string): Promise<{ draft: string }> {
    const complaint = await this.fetchComplaint(complaintId);
    const prompt = `
لخّص الشكوى التالية بلغة عربية واضحة وموجزة (فقرة واحدة أو اثنتان):

${this.summaryBullet(complaint)}
    `.trim();

    const draft = await this.generateDraft(prompt);
    return { draft };
  }

  async summarizeComplaints(complaintIds: string[]): Promise<{ draft: string }> {
    const complaints = await this.fetchComplaints(complaintIds);
    if (complaints.length === 0) {
      throw new NotFoundException("No complaints found");
    }

    const prompt = `
لخّص الشكاوى التالية (${complaints.length} شكوى) في ملخصٍ واحدٍ متماسك باللغة العربية،
يغطي القضايا المشتركة والاختلافات بينها، مع الإشارة لرقم كل شكوى عند الحاجة:

${complaints.map((c) => this.summaryBullet(c)).join("\n\n")}
    `.trim();

    const draft = await this.generateDraft(prompt);
    return { draft };
  }

  async draftReport(from: string, to: string): Promise<{ draft: string }> {
    const data = await this.reportingService.getAchievementReport(
      undefined,
      from,
      to,
    );

    const draft = await this.generateDraft(
      this.reportPrompt(
        data,
        `عن شكاوى الفترة من ${new Date(from).toLocaleDateString("ar-EG")} إلى ${new Date(to).toLocaleDateString("ar-EG")}`,
      ),
    );
    return { draft };
  }

  async draftSelectionReport(complaintIds: string[]): Promise<{ draft: string }> {
    const data = await this.reportingService.getAchievementForIds(complaintIds);
    if (!data || data.governorateTotal === 0) {
      throw new NotFoundException("No complaints found for the selection");
    }

    const draft = await this.generateDraft(
      this.reportPrompt(data, "عن الشكاوى المحددة في هذا التقرير"),
    );
    return { draft };
  }

  private reportPrompt(
    data: {
      governorateTotal: number;
      governorateFinished: number;
      governorateAchievement: number;
      departments: Array<{
        department: string;
        total: number;
        finished: number;
        percentage: number;
      }>;
    },
    scopeLabel: string,
  ): string {
    return `
صُغ تقريراً دورياً رسمياً باللغة العربية ${scopeLabel}.

إجمالي الشكاوى: ${data.governorateTotal}
المنجز منها: ${data.governorateFinished}
نسبة الإنجاز الإجمالية: ${data.governorateAchievement}%

نسب الإنجاز حسب الجهة:
${data.departments.map((r) => `- ${r.department}: ${r.finished} من ${r.total} (${r.percentage}%)`).join("\n")}

اكتب التقرير بأسلوب رسمي حكومي مناسب للمراجعة والاعتماد.
    `.trim();
  }

  private summaryBullet(c: SummaryComplaint): string {
    return [
      `- رقم الشكوى: ${c.complaintNumber} لسنة ${c.statementYear}`,
      `- المواطن: ${c.citizen.fullName}`,
      `- القرية/المنطقة: ${c.citizen.village ?? "غير محدد"}`,
      `- الجهة المختصة: ${c.department?.name ?? "غير محددة"}`,
      `- موضوع الشكوى: ${c.subject}`,
      `- حالة الفحص: ${c.examinationStatus?.name ?? "قيد الفحص"}`,
      `- نتيجة الفحص: ${c.examinationResult ?? "لم يتم بعد"}`,
      `- ملاحظات: ${c.annotation ?? "لا يوجد"}`,
      `- تاريخ الورود: ${c.arrivalDate.toLocaleDateString("ar-EG")}`,
    ].join("\n");
  }

  private async fetchComplaint(complaintId: string) {
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
    return complaint;
  }

  private fetchComplaints(complaintIds: string[]) {
    return this.prisma.client.complaint.findMany({
      where: { id: { in: complaintIds } },
      include: {
        citizen: true,
        department: true,
        examinationStatus: true,
      },
    });
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
    if (!ENABLE_AI) {
      throw new ServiceUnavailableException(
        "خدمة الذكاء الاصطناعي غير مفعّلة حالياً. يرجى التواصل مع مدير النظام لتفعيلها.",
      );
    }

    let attempt = 0;

    while (attempt < retries) {
      try {
        const agent = await getOrCreateAgent();
        const response = await agent.generate(prompt, {
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