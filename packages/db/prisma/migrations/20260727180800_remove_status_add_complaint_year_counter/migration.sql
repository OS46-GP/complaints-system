-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "status";

-- DropEnum
DROP TYPE "ComplaintStatus";

-- CreateTable
CREATE TABLE "ComplaintYearCounter" (
    "year" INTEGER NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ComplaintYearCounter_pkey" PRIMARY KEY ("year")
);
