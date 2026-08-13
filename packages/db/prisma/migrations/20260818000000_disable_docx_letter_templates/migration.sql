-- DOCX letter templates are no longer supported (HTML-only editor).
-- Deactivate existing ones so they disappear from the letter generation dialog.
UPDATE "LetterTemplate" SET "isActive" = false WHERE "type" = 'DOCX';
