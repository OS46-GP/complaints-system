-- DropIndex
DROP INDEX "ComplaintDepartment_complaintId_departmentId_key";

-- AlterTable
ALTER TABLE "ComplaintDepartment" ADD COLUMN     "endedAt" TIMESTAMP(3);
ALTER TABLE "ComplaintDepartment" ADD COLUMN     "assignmentIndex" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "ComplaintDepartment_complaintId_departmentId_idx" ON "ComplaintDepartment"("complaintId", "departmentId");