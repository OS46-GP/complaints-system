-- CreateEnum
CREATE TYPE "LetterTemplateType" AS ENUM ('HTML', 'DOCX', 'PDF_LETTERHEAD');

-- CreateTable
CREATE TABLE "LetterTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "LetterTemplateType" NOT NULL DEFAULT 'HTML',
    "body" TEXT,
    "assetKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LetterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetterSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "organizationNameAr" TEXT,
    "organizationNameEn" TEXT,
    "organizationAddress" TEXT,
    "organizationPhone" TEXT,
    "organizationFax" TEXT,
    "organizationEmail" TEXT,
    "organizationWebsite" TEXT,
    "organizationLetterhead" TEXT,
    "managerName" TEXT,
    "managerTitle" TEXT,
    "managerSignature" TEXT,
    "seal" TEXT,
    "responseDefaultDays" INTEGER NOT NULL DEFAULT 15,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LetterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetterGeneration" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "generatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LetterGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LetterTemplate_isActive_idx" ON "LetterTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LetterGeneration_complaintId_templateId_key" ON "LetterGeneration"("complaintId", "templateId");

-- CreateIndex
CREATE INDEX "LetterGeneration_templateId_idx" ON "LetterGeneration"("templateId");

-- AddForeignKey
ALTER TABLE "LetterGeneration" ADD CONSTRAINT "LetterGeneration_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterGeneration" ADD CONSTRAINT "LetterGeneration_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LetterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterGeneration" ADD CONSTRAINT "LetterGeneration_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;