-- CreateEnum
CREATE TYPE "LetterVariableType" AS ENUM ('text', 'textarea', 'date', 'image');

-- CreateTable
CREATE TABLE "LetterVariable" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'custom',
    "groupLabelAr" TEXT NOT NULL DEFAULT 'متغيرات مخصصة',
    "type" "LetterVariableType" NOT NULL DEFAULT 'text',
    "defaultValue" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterVariable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LetterVariable_key_key" ON "LetterVariable"("key");

-- CreateIndex
CREATE INDEX "LetterVariable_group_idx" ON "LetterVariable"("group");

-- CreateIndex
CREATE INDEX "LetterVariable_isActive_idx" ON "LetterVariable"("isActive");

-- CreateIndex
CREATE INDEX "LetterVariable_isSystem_idx" ON "LetterVariable"("isSystem");

-- Seed the current built-in placeholder registry as system rows
INSERT INTO "LetterVariable" ("id", "key", "labelAr", "group", "groupLabelAr", "type", "sortOrder", "required", "isSystem", "isActive", "createdAt", "updatedAt") VALUES
('seed-complaint-0', 'complaintNumber', 'رقم الشكوى', 'complaint', 'بيانات الشكوى', 'text', 0, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-1', 'statementYear', 'سنة البيان', 'complaint', 'بيانات الشكوى', 'text', 1, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-2', 'arrivalDate', 'تاريخ الوصول', 'complaint', 'بيانات الشكوى', 'date', 2, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-3', 'severity', 'الدرجة', 'complaint', 'بيانات الشكوى', 'text', 3, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-4', 'department', 'الجهة المختصة', 'complaint', 'بيانات الشكوى', 'text', 4, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-5', 'departmentOfficial', 'السيد/ مدير الجهة', 'complaint', 'بيانات الشكوى', 'text', 5, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-6', 'complaintType', 'فئة الشكوى', 'complaint', 'بيانات الشكوى', 'text', 6, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-7', 'receptionMethod', 'طريقة الاستلام', 'complaint', 'بيانات الشكوى', 'text', 7, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-8', 'examinationStatus', 'حالة الفحص', 'complaint', 'بيانات الشكوى', 'text', 8, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-9', 'presentationStatus', 'حالة العرض', 'complaint', 'بيانات الشكوى', 'text', 9, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-10', 'caseStatus', 'حالة القضية', 'complaint', 'بيانات الشكوى', 'text', 10, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-11', 'citizenName', 'اسم المواطن', 'complaint', 'بيانات الشكوى', 'text', 11, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-12', 'citizenNationalId', 'الرقم القومي', 'complaint', 'بيانات الشكوى', 'text', 12, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-13', 'citizenMobile', 'الهاتف', 'complaint', 'بيانات الشكوى', 'text', 13, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-14', 'citizenAddress', 'العنوان', 'complaint', 'بيانات الشكوى', 'textarea', 14, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-15', 'citizenVillage', 'القرية', 'complaint', 'بيانات الشكوى', 'text', 15, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-16', 'citizenDistrict', 'المركز', 'complaint', 'بيانات الشكوى', 'text', 16, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-17', 'subject', 'موضوع الشكوى', 'complaint', 'بيانات الشكوى', 'textarea', 17, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-18', 'annotation', 'الملاحظات', 'complaint', 'بيانات الشكوى', 'textarea', 18, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-19', 'respondentName', 'اسم المسؤول', 'complaint', 'بيانات الشكوى', 'text', 19, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-20', 'authorityResponseText', 'رد الجهة المختصة', 'complaint', 'بيانات الشكوى', 'textarea', 20, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-21', 'authorityResponseDate', 'تاريخ الرد', 'complaint', 'بيانات الشكوى', 'date', 21, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-22', 'incomingResponseNumber', 'رقم الرد الوارد', 'complaint', 'بيانات الشكوى', 'text', 22, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-23', 'archiveNumber', 'رقم الأرشيف', 'complaint', 'بيانات الشكوى', 'text', 23, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-24', 'archiveDate', 'تاريخ الأرشفة', 'complaint', 'بيانات الشكوى', 'date', 24, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-25', 'archiveLocation', 'موقع الأرشيف', 'complaint', 'بيانات الشكوى', 'textarea', 25, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-26', 'createdBy', 'أدخلها', 'complaint', 'بيانات الشكوى', 'text', 26, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-complaint-27', 'createdAt', 'تاريخ الإدخال', 'complaint', 'بيانات الشكوى', 'date', 27, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-28', 'organizationNameAr', 'اسم الجهة (عربي)', 'settings', 'بيانات الجهة والمدير', 'text', 28, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-29', 'organizationNameEn', 'اسم الجهة (إنجليزي)', 'settings', 'بيانات الجهة والمدير', 'text', 29, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-30', 'organizationAddress', 'عنوان الجهة', 'settings', 'بيانات الجهة والمدير', 'text', 30, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-31', 'organizationPhone', 'هاتف الجهة', 'settings', 'بيانات الجهة والمدير', 'text', 31, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-32', 'organizationFax', 'فاكس الجهة', 'settings', 'بيانات الجهة والمدير', 'text', 32, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-33', 'organizationEmail', 'البريد الإلكتروني', 'settings', 'بيانات الجهة والمدير', 'text', 33, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-34', 'organizationWebsite', 'الموقع الإلكتروني', 'settings', 'بيانات الجهة والمدير', 'text', 34, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-35', 'organizationLetterhead', 'ترويسة الجهة (صورة)', 'settings', 'بيانات الجهة والمدير', 'image', 35, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-36', 'managerName', 'اسم المدير', 'settings', 'بيانات الجهة والمدير', 'text', 36, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-37', 'managerTitle', 'صفة المدير', 'settings', 'بيانات الجهة والمدير', 'text', 37, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-38', 'managerSignature', 'توقيع المدير (صورة)', 'settings', 'بيانات الجهة والمدير', 'image', 38, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-39', 'seal', 'الختم الرسمي (صورة)', 'settings', 'بيانات الجهة والمدير', 'image', 39, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-settings-40', 'responseDefaultDays', 'مدة الرد المطلوبة (أيام)', 'settings', 'بيانات الجهة والمدير', 'text', 40, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-special-41', 'generatedDate', 'تاريخ إصدار الخطاب', 'special', 'بيانات الإصدار', 'date', 41, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seed-special-42', 'generatedTime', 'وقت إصدار الخطاب', 'special', 'بيانات الإصدار', 'text', 42, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);