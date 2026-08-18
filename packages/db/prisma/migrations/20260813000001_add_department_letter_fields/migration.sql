-- AlterTable
ALTER TABLE "ComplaintDepartment" ADD COLUMN "outgoingLetterNumber" TEXT;
ALTER TABLE "ComplaintDepartment" ADD COLUMN "outgoingLetterDate" TIMESTAMP(3);
ALTER TABLE "ComplaintDepartment" ADD COLUMN "responseDeadlineDays" INTEGER;