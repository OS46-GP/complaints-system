import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
    data: [
      {
        code: "MEN",
        name: "محافظة المنوفية",
        parentCode: null,
        level: 1,
        levelDesc: "محافظة",
        p0: "MEN",
      },
      {
        code: "MEN_SHB",
        name: "مركز شبين الكوم",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_SHB",
      },
      {
        code: "MEN_QWS",
        name: "مركز قويسنا",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_QWS",
      },
      {
        code: "MEN_BRK",
        name: "مركز بركة السبع",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_BRK",
      },
      {
        code: "MEN_TLA",
        name: "مركز تلا",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_TLA",
      },
      {
        code: "MEN_MNF",
        name: "مركز منوف",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_MNF",
      },
      {
        code: "MEN_ASH",
        name: "مركز أشمون",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_ASH",
      },
      {
        code: "MEN_BAG",
        name: "مركز الباجور",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_BAG",
      },
      {
        code: "MEN_SAD",
        name: "مركز السادات",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_SAD",
      },
      {
        code: "MEN_SHD",
        name: "مركز الشهداء",
        parentCode: "MEN",
        level: 2,
        levelDesc: "مركز",
        p0: "MEN",
        p1: "MEN_SHD",
      },
    ],
  });
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