import "dotenv/config";
import { prisma } from "../src/index";

async function main() {
  console.log("Finding duplicate citizens by nationalId...");

  const groups = await prisma.citizen.groupBy({
    by: ["nationalId"],
    where: { nationalId: { not: null } },
    _count: { id: true },
  });

  const duplicates = groups.filter((g) => g.nationalId && g._count.id > 1);

  if (duplicates.length === 0) {
    console.log("No duplicate citizens found.");
    return;
  }

  console.log(`Found ${duplicates.length} duplicate nationalId(s):`);
  for (const d of duplicates) {
    console.log(`  ${d.nationalId} → ${d._count.id} records`);
  }

  let totalMerged = 0;

  for (const { nationalId } of duplicates) {
    const citizens = await prisma.citizen.findMany({
      where: { nationalId },
      orderBy: { updatedAt: "desc" },
    });

    if (citizens.length <= 1) continue;

    const [keep, ...remove] = citizens;

    let complaintCount = 0;
    for (const dup of remove) {
      const result = await prisma.complaint.updateMany({
        where: { citizenId: dup.id },
        data: { citizenId: keep.id },
      });
      complaintCount += result.count;
    }

    await prisma.citizen.deleteMany({
      where: { id: { in: remove.map((c) => c.id) } },
    });

    totalMerged += remove.length;
    console.log(
      `Merged ${remove.length} duplicate(s) for nationalId ${nationalId} → kept citizen ${keep.id} (${complaintCount} complaints reassigned)`,
    );
  }

  console.log(`Done. Merged ${totalMerged} duplicate citizen(s).`);
}

main()
  .catch((e) => {
    console.error("Failed to merge duplicates:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
