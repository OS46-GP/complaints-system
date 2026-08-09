import type { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { resolveChatModel } from "../../common/llm/model-provider";

export const ENABLE_AI = Boolean(process.env.LLM_MODEL);

// When ENABLE_AI is false, posts pass the regex pre-filter unchanged and no
// extraction is performed (draft is created with postText only).

const fieldsSchema = z.object({
  subject: z.string(),
  annotation: z.string(),
  citizenFullName: z.string(),
  citizenNationalId: z.string(),
  citizenMobileNumber: z.string(),
  citizenAddress: z.string(),
  citizenVillage: z.string(),
  citizenDistrict: z.string(),
  complaintType: z.string(),
  receptionMethod: z.string(),
  severity: z.enum(["Low", "Medium", "High"]),
});

const socialIntakeSchema = z.object({
  isRelevant: z.boolean(),
  reason: z.string(),
  fields: fieldsSchema,
});

const batchSchema = z.object({
  results: z.array(
    socialIntakeSchema.extend({ index: z.number() }),
  ),
});

export type SocialIntakeResult = z.infer<typeof socialIntakeSchema>;

const FALLBACK_FIELDS: SocialIntakeResult["fields"] = {
  subject: "",
  annotation: "",
  citizenFullName: "",
  citizenNationalId: "",
  citizenMobileNumber: "",
  citizenAddress: "",
  citizenVillage: "",
  citizenDistrict: "",
  complaintType: "",
  receptionMethod: "",
  severity: "Medium",
};

let socialIntakeAgent: Agent | null = null;

async function getOrCreateAgent(): Promise<Agent> {
  if (!socialIntakeAgent) {
    const { Agent } = await import("@mastra/core/agent");
    socialIntakeAgent = new Agent({
      id: "social-intake-agent",
      name: "Social Intake Agent",
      instructions: `You are a social media intake agent for a government complaints system in Menofia Governorate, Egypt.
You receive a batch of Facebook posts collected from monitored groups. Each post is numbered [POST i] followed by its text.

For EACH post, decide two things:

1. FILTER (isRelevant)
A post is RELEVANT if it reports a real issue or problem affecting citizens that a government authority should handle — e.g. broken infrastructure, water/electricity outages, garbage collection, road damage, public services, school/hospital issues, harassment of citizens, unlicensed businesses, missing streetlights, sewage problems.
A post is NOT RELEVANT (spam/irrelevant) if it is: a classified ad (selling/buying cars, land, apartments, phones), a commercial advertisement or promotion, a job offer, a social invitation, general chit-chat, news sharing without a complaint, political commentary, or anything without an actionable citizen issue.

2. EXTRACT FORM FIELDS (fields)
For relevant posts, extract these fields from the post text (write in Arabic, keep the original wording where possible):
- subject — a short summary title (max 200 characters)
- annotation — the full complaint description in clean Arabic (max 5000 characters)
- citizenFullName — the name of the citizen complaining if mentioned in the post text
- citizenNationalId — a 14-digit Egyptian National ID if present (validate: exactly 14 digits)
- citizenMobileNumber — an Egyptian mobile number if present (starts with 01, 11 digits)
- citizenAddress — the COMPLETE location of the incident exactly as written in the post: street name, block/area (مخطط), landmark, village — keep the full original wording, do NOT truncate. Even if the address includes a village or center name, put the whole location here.
- citizenVillage — the village name if mentioned anywhere in the post text (it is often part of the address)
- citizenDistrict — the district/center (مركز) name if mentioned anywhere in the post text
- complaintType — pick the closest category from the KNOWN COMPLAINT CATEGORIES list given in the prompt (use the exact category name as written); leave empty if no category clearly matches
- receptionMethod — how the citizen submitted/reported the complaint if mentioned in the post text (e.g. هاتف, بريد, فيس بوك, مكتب, باليد); leave empty if not mentioned
- severity — Low (individual minor issue) / Medium (affects several people) / High (danger to life, health, or large community impact)

EXAMPLE:
[POST 0] Author: unknown
Text: نرجوا التحقيق في عدم دخول عربات القمامه الى شارع الحاج أحمد عثمان بمخطط العشماوي بالبتانون منذ أكثر من شهرين وترك جبل من القمامة خلف هذا الشارع ايضا
→ subject: "عدم دخول عربات القمامة لشارع الحاج أحمد عثمان بالبتانون"
→ annotation: "نرجوا التحقيق في عدم دخول عربات القمامه الى شارع الحاج أحمد عثمان بمخطط العشماوي بالبتانون منذ أكثر من شهرين وترك جبل من القمامة خلف هذا الشارع ايضا"
→ citizenAddress: "شارع الحاج أحمد عثمان بمخطط العشماوي بالبتانون"
→ citizenVillage: "البتانون"
→ citizenDistrict: ""
→ complaintType: "التضرر من المخلفات"
→ receptionMethod: ""
→ severity: "Medium"

RULES:
- Return exactly ONE result per post, with index matching the [POST i] number
- Only fill fields that are actually present or clearly inferable from the post text; leave others as empty strings
- Do not invent names, IDs, or phone numbers
- When in doubt about relevance, err on the side of isRelevant=true — the system prefers false positives over false negatives (a human reviews every draft)`,
      model: resolveChatModel(process.env.LLM_MODEL),
    });
  }
  return socialIntakeAgent;
}

export interface PostToAnalyze {
  text: string;
  authorName?: string;
}

export type BatchAnalysisResult = SocialIntakeResult & { index: number };

function fallbackResult(index: number, reason: string): BatchAnalysisResult {
  return {
    index,
    isRelevant: true,
    reason,
    fields: { ...FALLBACK_FIELDS },
  };
}

export async function analyzePosts(
  posts: PostToAnalyze[],
  knownComplaintCategories: string[] = [],
): Promise<BatchAnalysisResult[]> {
  if (posts.length === 0) return [];
  if (!ENABLE_AI) {
    return posts.map((_, i) => fallbackResult(i, "AI disabled — accepting post"));
  }

  const agent = await getOrCreateAgent();
  const prompt = [
    knownComplaintCategories.length > 0
      ? `KNOWN COMPLAINT CATEGORIES (pick the exact name from this list for complaintType, or an empty string if none fits): ${knownComplaintCategories.join("، ")}`
      : "",
    ...posts.map(
      (p, i) =>
        `[POST ${i}] Author: ${p.authorName || "unknown"}\nText:\n${p.text}`,
    ),
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const result = await agent.generate(prompt, {
      structuredOutput: {
        schema: batchSchema,
        jsonPromptInjection: "auto",
      },
    });
    const parsed = (result.object ?? null) as {
      results?: BatchAnalysisResult[];
    } | null;

    const results = parsed?.results ?? [];
    if (results.length === 0) {
      console.warn("Social intake agent returned no results — accepting all posts");
      return posts.map((_, i) => fallbackResult(i, "empty AI response"));
    }

    const byIndex = new Map<number, BatchAnalysisResult>();
    for (const r of results) {
      if (typeof r.index === "number") byIndex.set(r.index, r);
    }

    return posts.map((_, i) => byIndex.get(i) ?? fallbackResult(i, "missing AI result"));
  } catch (error) {
    console.error(
      `Social intake agent failed (falling back to accepting posts): ${
        error instanceof Error ? error.message : error
      }`,
    );
    return posts.map((_, i) => fallbackResult(i, "AI error — accepting post"));
  }
}
