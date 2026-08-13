-- AlterTable
ALTER TABLE "LetterTemplate" ADD COLUMN "variables" JSONB;

-- AlterTable
ALTER TABLE "LetterGeneration" ADD COLUMN "variableValues" JSONB;