import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { Mastra } from "@mastra/core/mastra";
import { ServiceUnavailableException } from "@nestjs/common";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

// ─── IPv4-only fetch ────────────────────────────────────────────────────────
// undici (Node.js's built-in fetch) uses Happy Eyeballs: it tries all IPv4 +
// IPv6 addresses simultaneously. When IPv6 is unreachable (no IPv6 routing),
// the combined 10s timeout fires before any IPv4 attempt succeeds.
// Forcing family: 4 fixes this by telling undici to only dial IPv4 addresses.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Agent: UndiciAgent, fetch: undiciFetch } = require("undici");
const ipv4Agent = new UndiciAgent({ connect: { family: 4 } });
const ipv4Fetch = (url: string | URL | Request, init?: RequestInit) =>
  undiciFetch(url, { ...(init as object), dispatcher: ipv4Agent }) as Promise<Response>;

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY ?? "",
  fetch: ipv4Fetch,
});

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

// ─── Tool: Echo complaint data (pre-fetched by AgentService, passed in prompt) ──
// Note: The AgentService fetches DB data itself using PrismaService (NestJS DI).
// Tools here are lightweight pass-through wrappers for Mastra's structured tool API.

export const summarizeComplaintTool = createTool({
  id: "summarize-complaint",
  description: "يلخص بيانات شكوى مواطن بلغة عربية رسمية موجزة.",
  inputSchema: z.object({
    complaintData: z.string().describe("بيانات الشكوى بصيغة نصية"),
  }),
  execute: async (input) => {
    return input.complaintData;
  },
});

export const draftReportTool = createTool({
  id: "draft-report",
  description: "يصيغ تقريراً دورياً رسمياً بناءً على إحصاءات الشكاوى لفترة زمنية.",
  inputSchema: z.object({
    reportData: z.string().describe("إحصاءات الشكاوى بصيغة نصية"),
  }),
  execute: async (input) => {
    return input.reportData;
  },
});

export const draftMemoTool = createTool({
  id: "draft-memo",
  description: "يصيغ خطاباً رسمياً (مذكرة) متعلقاً بشكوى محددة.",
  inputSchema: z.object({
    memoData: z.string().describe("بيانات الشكوى لصياغة المذكرة"),
  }),
  execute: async (input) => {
    return input.memoData;
  },
});

// ─── Mastra Agent ─────────────────────────────────────────────────────────
export const complaintsAgent = new Agent({
  id: "complaints-agent",
  name: "ComplaintsAgent",
  instructions: AGENT_INSTRUCTIONS,
  model: googleAI("gemini-2.5-flash"),
  tools: {
    summarizeComplaintTool,
    draftReportTool,
    draftMemoTool,
  },
});

// ─── Mastra Instance (registered in AppModule via MastraModule) ───────────
export const mastra = new Mastra({
  agents: { complaintsAgent },
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
