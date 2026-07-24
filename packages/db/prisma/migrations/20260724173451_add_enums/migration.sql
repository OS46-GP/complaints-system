/*
  Warnings:

  - The `status` column on the `Complaint` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('Low', 'Medium', 'High');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('Finished', 'NotFinished');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "severity" "Severity" NOT NULL DEFAULT 'Low',
DROP COLUMN "status",
ADD COLUMN     "status" "ComplaintStatus" NOT NULL DEFAULT 'NotFinished';

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");
