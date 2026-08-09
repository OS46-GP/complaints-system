import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { analyzePosts } from "./src/social/agents/social-intake-agent";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const drafts = await prisma.socialDraft.findMany({
    where: { status: "Pending" },
    orderBy: { detectedAt: "desc" },
  });
  const stale = drafts.filter((d) => {
    const f = d.extractedFields as Record<string, unknown> | null;
    return !f || typeof f !== "object" || !("citizenAddress" in f);
  });
  console.log(`Pending drafts: ${drafts.length}, stale (missing citizenAddress): ${stale.length}`);

  if (stale.length === 0) return;

  const complaintTypes = await prisma.complaintType.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  let results: Awaited<ReturnType<typeof analyzePosts>> | null = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const attemptResults = await analyzePosts(
      stale.map((d) => ({ text: d.postText, authorName: d.authorName ?? undefined })),
      complaintTypes.map((t) => t.name),
    );
    const anyExtraction = attemptResults.some(
      (r) =>
        r.fields.citizenAddress ||
        r.fields.citizenVillage ||
        r.fields.complaintType ||
        r.fields.subject,
    );
    if (anyExtraction) {
      results = attemptResults;
      break;
    }
    console.log(`Attempt ${attempt} yielded no extraction, retrying in ${attempt * 10}s...`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 10_000));
  }
  if (!results) throw new Error("AI extraction failed after retries");

  let updated = 0;
  for (let i = 0; i < stale.length; i++) {
    const result = results[i];
    if (!result || !result.isRelevant) continue;
    const hasExtraction =
      result.fields.subject ||
      result.fields.annotation ||
      result.fields.citizenFullName ||
      result.fields.citizenAddress ||
      result.fields.citizenVillage ||
      result.fields.citizenDistrict ||
      result.fields.complaintType ||
      result.fields.receptionMethod;
    if (!hasExtraction) continue;
    await prisma.socialDraft.update({
      where: { id: stale[i].id },
      data: { extractedFields: result.fields },
    });
    updated++;
    console.log(`Healed ${stale[i].id}: address="${result.fields.citizenAddress}" village="${result.fields.citizenVillage}" type="${result.fields.complaintType}"`);
  }
  console.log(`Updated ${updated}/${stale.length} drafts`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
