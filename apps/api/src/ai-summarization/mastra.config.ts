import type { Agent } from "@mastra/core/agent";
import { resolveChatModel } from "../common/llm/model-provider";

const ENABLE_AI = Boolean(process.env.LLM_MODEL);
// When ENABLE_AI is false, the summarization / report-drafting endpoints
// return 503 — there is no deterministic fallback for prose generation.

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

let summarizationAgent: Agent | null = null;

async function getOrCreateAgent(): Promise<Agent> {
  if (!summarizationAgent) {
    const { Agent } = await import("@mastra/core/agent");
    summarizationAgent = new Agent({
      id: "complaints-agent",
      name: "ComplaintsAgent",
      instructions: AGENT_INSTRUCTIONS,
      model: resolveChatModel(process.env.LLM_MODEL),
    });
  }
  return summarizationAgent;
}

export { ENABLE_AI, getOrCreateAgent };