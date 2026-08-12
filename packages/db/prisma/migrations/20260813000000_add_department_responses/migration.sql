-- AlterTable
ALTER TABLE "ComplaintDepartment" ADD COLUMN "responseText" TEXT;
ALTER TABLE "ComplaintDepartment" ADD COLUMN "responseNumber" TEXT;
ALTER TABLE "ComplaintDepartment" ADD COLUMN "responseDate" TIMESTAMP(3);
ALTER TABLE "ComplaintDepartment" ADD COLUMN "examinationStatusId" INTEGER;
ALTER TABLE "ComplaintDepartment" ADD COLUMN "examinationResult" TEXT;
ALTER TABLE "ComplaintDepartment" ADD COLUMN "respondedAt" TIMESTAMP(3);
ALTER TABLE "ComplaintDepartment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ComplaintDepartment_examinationStatusId_idx" ON "ComplaintDepartment"("examinationStatusId");

-- AddForeignKey
ALTER TABLE "ComplaintDepartment" ADD CONSTRAINT "ComplaintDepartment_examinationStatusId_fkey" FOREIGN KEY ("examinationStatusId") REFERENCES "ExaminationStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;