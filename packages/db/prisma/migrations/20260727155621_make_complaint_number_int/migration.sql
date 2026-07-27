/*
  Warnings:

  - Changed the type of `complaintNumber` on the `Complaint` table from TEXT to INTEGER.
  - Reassigns sequential complaint numbers per year for existing data.
*/

-- Reassign sequential complaint numbers per year to avoid duplicates
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "statementYear" ORDER BY "arrivalDate", "id") AS new_num
  FROM "Complaint"
)
UPDATE "Complaint" c
SET "complaintNumber" = n.new_num
FROM numbered n
WHERE c.id = n.id;

-- Alter the column type
ALTER TABLE "Complaint" ALTER COLUMN "complaintNumber" TYPE INTEGER USING ("complaintNumber"::integer);

-- The unique index is already managed by Prisma's @@unique attribute
