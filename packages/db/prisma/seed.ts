import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { LOCATION_SEED } from "./location-seed.data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SEQUENCE_TABLES = [
  "ReceptionMethod",
  "ComplaintType",
  "ExaminationStatus",
  "PresentationStatus",
] as const;

async function syncSequences() {
  for (const table of SEQUENCE_TABLES) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"','id'), (SELECT MAX(id) FROM "${table}"))`,
    );
  }
}

async function pruneFakeLocationHierarchy() {
  const leftover = await prisma.location.findFirst({
    where: { code: { startsWith: "MEN" } },
    select: { code: true },
  });
  if (!leftover) return;
  const attached = await prisma.citizen.count({
    where: { locationCode: { startsWith: "MEN" } },
  });
  if (attached > 0) {
    console.warn(`Skipping removal of legacy "MEN" locations: ${attached} citizens still reference them.`);
    return;
  }
  const deleted = await prisma.location.deleteMany({
    where: { code: { startsWith: "MEN" } },
  });
  if (deleted.count > 0) {
    console.log(`Removed legacy fake location hierarchy (${deleted.count} rows).`);
  }
}

async function backfillCitizenLocations() {
  const locations = await prisma.location.findMany({
    select: { code: true, name: true, level: true, parentCode: true },
  });
  const byCode = new Map(
    locations.map((location) => [location.code, location]),
  );

  const districtFor = (location: (typeof locations)[number]): string => {
    if (location.level === 2) return location.name;
    let current = location;
    while (current.parentCode) {
      const parent = byCode.get(current.parentCode);
      if (!parent) break;
      current = parent;
      if (current.level === 2) return current.name;
    }
    return "";
  };

  let updated = 0;
  const BATCH = 1000;
  let cursor = "";
  for (;;) {
    const citizens = await prisma.citizen.findMany({
      where: {
        locationCode: { not: null },
        OR: [{ district: null }, { district: "" }, { village: null }, { village: "" }],
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      select: { id: true, locationCode: true, district: true, village: true },
      orderBy: { id: "asc" },
      take: BATCH,
    });
    if (citizens.length === 0) break;
    for (const citizen of citizens) {
      const location = citizen.locationCode ? byCode.get(citizen.locationCode) : undefined;
      if (!location) continue;
      const district = citizen.district ? undefined : districtFor(location);
      const village =
        citizen.village
          ? undefined
          : (location.level ?? 0) >= 2
            ? location.name
            : undefined;
      if (!district && !village) continue;
      await prisma.citizen.update({
        where: { id: citizen.id },
        data: { ...(district ? { district } : {}), ...(village ? { village } : {}) },
      });
      updated += 1;
    }
    cursor = citizens[citizens.length - 1].id;
  }
  console.log(`Backfilled village/district for ${updated} citizens.`);
}

async function main() {
  await prisma.receptionMethod.createMany({
    skipDuplicates: true,
    data: [
      { id: 1, name: "يدوي" },
      { id: 2, name: "هاتف" },
      { id: 3, name: "بريد" },
      { id: 4, name: "إلكتروني" },
      { id: 5, name: "المسح الضوئي" },
      { id: 6, name: "وسائل التواصل الاجتماعي" },
      { id: 7, name: "مراقبة وسائل التواصل" },
    ],
  });

  await prisma.complaintType.createMany({
    skipDuplicates: true,
    data: [
      { id: 1, name: "خدمة" },
      { id: 2, name: "إداري" },
      { id: 3, name: "مالي" },
      { id: 4, name: "مرافق" },
      { id: 5, name: "صحة" },
      { id: 6, name: "تعليم" },
      { id: 7, name: "زراعة" },
      { id: 8, name: "بيئة" },
      { id: 9, name: "طرق" },
      { id: 10, name: "أمن" },
    ],
  });

  await prisma.examinationStatus.createMany({
    skipDuplicates: true,
    data: [
      { id: 1, name: "قيد الفحص" },
      { id: 2, name: "تم الفحص" },
      { id: 3, name: "مستوفي" },
      { id: 4, name: "غير مستوفي" },
    ],
  });

  await prisma.presentationStatus.createMany({
    skipDuplicates: true,
    data: [
      { id: 1, name: "لم يعرض" },
      { id: 2, name: "تم العرض" },
      { id: 3, name: "معتمد" },
      { id: 4, name: "مرفوض" },
    ],
  });

  await prisma.department.createMany({
    skipDuplicates: true,
    data: [
      { name: "ديوان عام المحافظة", subAuthority: "مكتب المحافظ" },
      { name: "ديوان عام المحافظة", subAuthority: "مكتب نائب المحافظ" },
      { name: "ديوان عام المحافظة", subAuthority: "الشؤون القانونية" },
      { name: "ديوان عام المحافظة", subAuthority: "الشؤون المالية والإدارية" },
      { name: "مديرية الصحة", subAuthority: "مستشفيات" },
      { name: "مديرية الصحة", subAuthority: "الوحدات الصحية" },
      { name: "مديرية التربية والتعليم", subAuthority: "مدارس" },
      { name: "مديرية التربية والتعليم", subAuthority: "الإدارات التعليمية" },
      { name: "مديرية التضامن الاجتماعي", subAuthority: null },
      { name: "مديرية الزراعة", subAuthority: null },
      { name: "مديرية الري", subAuthority: null },
      { name: "مديرية الإسكان والمرافق", subAuthority: "مياه الشرب والصرف الصحي" },
      { name: "مديرية الإسكان والمرافق", subAuthority: "الكهرباء" },
      { name: "مديرية الطرق والنقل", subAuthority: null },
      { name: "مديرية الشباب والرياضة", subAuthority: null },
      { name: "مديرية البيئة", subAuthority: null },
      { name: "مديرية التموين والتجارة الداخلية", subAuthority: null },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة شبين الكوم" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة قويسنا" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة بركة السبع" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة تلا" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة منوف" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة أشمون" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة الباجور" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة السادات" },
      { name: "الوحدة المحلية", subAuthority: "مركز ومدينة الشهداء" },
    ],
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      role: "Admin",
    },
  });

  await prisma.location.createMany({
    skipDuplicates: true,
    data: LOCATION_SEED.map(
      ({ p0, p1, p2, p3, p4, p5, ...location }) => location,
    ),
  });

  await pruneFakeLocationHierarchy();

  await backfillCitizenLocations();

  await syncSequences();
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