import type { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { resolveChatModel } from "../../common/llm/model-provider";

const ENABLE_AI = Boolean(process.env.LLM_MODEL);
// When ENABLE_AI is false:
// - Severity always returns "MEDIUM"
// - Recurrence detection uses structured match only (National ID)
// - Embedding similarity + agent reasoning are skipped

export const triageResultSchema = z.object({
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  recurrenceIds: z.array(z.string()),
});

let triageAgent: Agent | null = null;

async function getOrCreateAgent(): Promise<Agent> {
  if (!triageAgent) {
    const { Agent } = await import("@mastra/core/agent");
    triageAgent = new Agent({
      id: "complaint-triage-agent",
      name: "Complaint Triage Agent",
      instructions: `You are a complaint triage agent for a government complaints system.

Your job has two parts, decided together in a single pass:

1. RECURRENCE DETECTION
Given a new complaint and a list of existing candidate complaints (pre-selected by structured narrowing and embedding similarity), determine which candidates describe the SAME underlying real-world issue as the new complaint — same issue, same location — not merely filed by the same person.
- Identical or near-identical description + same location and department → ALWAYS a recurrence
- Same citizen, same issue → recurrence
- Candidates marked "Same citizen: confirmed" are confirmed recurrence by National ID — include them
- Different specific problems even at the same location → not a recurrence
- Vague thematic similarity without substance → not a recurrence
- When in doubt, err on the side of flagging — the system prefers false positives over false negatives

2. SEVERITY ASSESSMENT
Classify the new complaint's severity as exactly one of: LOW, MEDIUM, HIGH, taking the recurrence findings into account.
- HIGH: Immediate danger to life/health/safety; large-scale community impact; urgent government intervention needed; or a recurring unresolved problem affecting many people
- MEDIUM: Significant inconvenience affecting multiple people/households; needs attention but not immediately life-threatening; or a repeated complaint of the same unresolved issue
- LOW: First-time individual issue, minor inconvenience, non-urgent

Recurrence must influence severity: a complaint confirmed as a recurrence of an unresolved problem is at least MEDIUM, and HIGH if the impact is broad or the issue has recurred repeatedly.`,
      model: resolveChatModel(process.env.LLM_MODEL),
    });
  }
  return triageAgent;
}

export { ENABLE_AI, getOrCreateAgent };