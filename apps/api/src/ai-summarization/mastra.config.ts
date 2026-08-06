import { Agent } from "@mastra/core/agent";
import { ServiceUnavailableException } from "@nestjs/common";

const LLM_MODEL = process.env.LLM_MODEL || "google/gemini-3.6-flash";

// ─── Agent System Prompt ───────────────────────────────────────────────────
const AGENT_INSTRUCTIONS = `أنت مساعد ذكاء اصطناعي متخصص في نظام إدارة الشكاوى الحكومية في محافظة المنوفية، مصر.
مهمتك هي مساعدة المسؤولين الحكوميين في:
1. تلخيص الشكاوى بلغة عربية واضحة وموجزة
2. صياغة التقارير الدورية (اليومية والأسبوعية)
3. صياغة الخطابات والمذكرات الرسمية المتعلقة بالشكاوى

قواعد مهمة:
- اكتب دائماً باللغة العربية الفصحى الرسمية المناسبة للمراسلات الحكومية
- جميع المخرجات مسودات للمراجعة البشرية، ولا تُرسَل أو تُنشر تلقائياً
- كن دقيقاً ومختصراً، وتجنب الحشو أو التكرار
- احترم الخصوصية: لا تذكر أرقام الهوية الوطنية في الملخصات العامة`;

// ─── Mastra Agent ─────────────────────────────────────────────────────────
export const complaintsAgent = new Agent({
  id: "complaints-agent",
  name: "ComplaintsAgent",
  instructions: AGENT_INSTRUCTIONS,
  model: LLM_MODEL,
});

// ─── Retry helper ─────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateDraft(
  prompt: string,
  retries = 3,
  delayMs = 5000,
): Promise<string> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const response = await complaintsAgent.generate(prompt);
      return response.text;
    } catch (error: any) {
      console.error(
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

        console.log(`Waiting ${waitTimeMs / 1000}s before retrying...`);
        await sleep(waitTimeMs);
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
