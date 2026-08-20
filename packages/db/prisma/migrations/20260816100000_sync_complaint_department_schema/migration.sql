-- Reconstructed 2026-08-19: the original migration.sql for this migration was
-- lost (only an empty file was ever committed). The DB recorded this migration
-- as applied, so its SQL is recovered from the live schema diff:
--   replay(migrations \ sync) -> schema.prisma
-- which is exactly the following statements.
--
-- DropIndex
DROP INDEX "ComplaintDepartment_examinationStatusId_idx";

-- AlterTable
ALTER TABLE "ComplaintDepartment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LetterSettings" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LetterTemplate" ALTER COLUMN "updatedAt" DROP DEFAULT;