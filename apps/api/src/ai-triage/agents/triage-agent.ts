const LLM_MODEL = process.env.LLM_MODEL || '';
const ENABLE_AI = LLM_MODEL.length > 0;
// When ENABLE_AI is false:
// - Severity always returns "MEDIUM"
// - Recurrence detection uses structured match only (National ID)
// - Embedding similarity + agent reasoning are skipped

let triageAgent: {
  generate(prompt: string, options?: Record<string, unknown>): Promise<{ text: string }>;
} | null = null;

async function getOrCreateAgent(): Promise<{
  generate(prompt: string, options?: Record<string, unknown>): Promise<{ text: string }>;
}> {
  if (!triageAgent) {
    const { Agent } = await import('@mastra/core/agent');
    triageAgent = new Agent({
      id: 'complaint-triage-agent',
      name: 'Complaint Triage Agent',
      instructions: `You are a complaint triage agent for a government complaints system.

You have two responsibilities:

1. SEVERITY ASSESSMENT
Given complaint details, classify severity as exactly one of: LOW, MEDIUM, HIGH.
- HIGH: Immediate danger to life/health/safety; large-scale community impact; urgent government intervention needed
- MEDIUM: Significant inconvenience affecting multiple people/households; needs attention but not immediately life-threatening
- LOW: Individual issue, minor inconvenience, non-urgent

2. RECURRENCE REASONING
You are given a new complaint and a list of existing candidate complaints that were pre-selected by structured narrowing and embedding similarity.
Determine which candidate complaints, if any, describe the SAME underlying real-world issue as the new complaint.
Return ONLY a JSON array of indices matching genuine recurrences, e.g. [0, 3] or [].

Rules:
- Identical or near-identical description + same location and department → ALWAYS a recurrence (flag it)
- Same citizen, same issue → recurrence
- Different specific problems even at the same location → not recurrence
- Vague thematic similarity without substance → not recurrence
- When in doubt, err on the side of flagging — the system prefers false positives over false negatives`,
      model: LLM_MODEL,
    });
  }
  return triageAgent;
}

export { ENABLE_AI, getOrCreateAgent };
