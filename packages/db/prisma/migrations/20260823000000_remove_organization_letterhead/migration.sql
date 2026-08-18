-- Remove the letterhead (ترويسة الجهة) feature: delete its system variable row
-- and clear the stored letterhead image from the letter settings.

DELETE FROM "LetterVariable"
WHERE "key" = 'organizationLetterhead';

UPDATE "LetterSettings"
SET "organizationLetterhead" = NULL
WHERE "id" = 1;