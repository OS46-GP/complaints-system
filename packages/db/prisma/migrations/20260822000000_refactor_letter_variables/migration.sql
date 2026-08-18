-- DropIndex
DROP INDEX "LetterVariable_group_idx";

-- AlterTable
ALTER TABLE "LetterVariable" DROP COLUMN "group",
DROP COLUMN "groupLabelAr",
DROP COLUMN "sortOrder";

-- AlterTable
ALTER TABLE "LetterVariable" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "fallbackText" TEXT;
