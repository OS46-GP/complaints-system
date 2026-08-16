import type { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { resolveChatModel } from "../../common/llm/model-provider";

export const ENABLE_AI = Boolean(process.env.LLM_MODEL);

const optionalText = z.string().catch("").default("");

// Structured report of the complaints captured by one poll. Every field is
// tolerant so a malformed response degrades to an empty overview, never a
// failed poll.
export const pollSummarySchema = z.object({
  overview: optionalText,
  items: z
    .array(
      z.object({
        complaintType: optionalText,
        severity: z
          .enum(["Low", "Medium", "High"])
          .catch("Medium")
          .default("Medium"),
        summary: optionalText,
      }),
    )
    .catch([])
    .default([]),
});

export type PollSummary = z.infer<typeof pollSummarySchema>;

export interface ComplaintForSummary {
  subject: string;
  annotation: string;
  complaintType: string;
  severity: "Low" | "Medium" | "High";
  groupName: string;
}

let summaryAgent: Agent | null = null;

async function getOrCreateAgent(): Promise<Agent> {
  if (!summaryAgent) {
    const { Agent } = await import("@mastra/core/agent");
    summaryAgent = new Agent({
      id: "social-summary-agent",
      name: "Social Poll Summary Agent",
      instructions: `You are a reporting agent for a government complaints system in Menofia Governorate, Egypt.

You receive the complaints captured by one Facebook monitoring poll. Each complaint is numbered [COMPLAINT i] followed by its subject, full text, complaint type, severity, and source group.

Produce a short report in Arabic (اللغة العربية) with two parts:

1. overview — 2-4 sentences describing what the poll captured: how many complaints, their main topics, and any high-severity or urgent items that need immediate attention. Keep it plain and factual.

2. items — ONE item per input complaint (same order), each with:
- complaintType — the category of the complaint (use the input value if present)
- severity — the input severity
- summary — a 1-2 sentence plain-language summary of the complaint in Arabic

RULES:
- Never invent complaints, details, numbers, names, or locations that are not in the input.
- Do not add opinions or recommendations about how to solve the issues.
- Write summaries in clear, plain Arabic that an official can skim quickly.
- If there are no complaints, return an empty items array and an overview that says so.`,
      model: resolveChatModel(process.env.LLM_MODEL),
    });
  }
  return summaryAgent;
}

function sanitizeText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
}

/**
 * Summarize/report the complaints captured by one poll. Runs as a second LLM
 * call after the intake agent has filtered and extracted the relevant posts.
 * Returns null when AI is disabled, there are no complaints, or the call
 * fails (the poll itself must never fail because the report failed).
 */
export async function summarizeComplaints(
  complaints: ComplaintForSummary[],
): Promise<PollSummary | null> {
  if (complaints.length === 0 || !ENABLE_AI) return null;

  const prompt = complaints
    .map(
      (c, i) =>
        `[COMPLAINT ${i}] Group: ${c.groupName}\nSubject: ${c.subject}\nText: ${sanitizeText(c.annotation)}\nComplaint type: ${c.complaintType || "غير محدد"}\nSeverity: ${c.severity}`,
    )
    .join("\n\n");

  try {
    const agent = await getOrCreateAgent();
    const result = await agent.generate(prompt, {
      structuredOutput: {
        schema: pollSummarySchema,
        jsonPromptInjection: "auto",
      },
    });
    return (result.object ?? null) as PollSummary | null;
  } catch (error) {
    console.error(
      `Social summary agent failed (returning no report): ${
        error instanceof Error ? error.message : error
      }`,
    );
    return null;
  }
}
