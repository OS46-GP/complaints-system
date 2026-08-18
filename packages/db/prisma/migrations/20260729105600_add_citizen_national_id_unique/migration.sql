-- Drop the non-unique index, replace with a unique constraint
DROP INDEX IF EXISTS "Citizen_nationalId_idx";
CREATE UNIQUE INDEX "Citizen_nationalId_key" ON "Citizen"("nationalId");
