import type { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { resolveChatModel } from "../../common/llm/model-provider";

const ocrField = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1),
});

export const ocrFieldsSchema = z.object({
  fields: z.object({
    citizen_fullName: ocrField.optional(),
    citizen_nationalId: ocrField.optional(),
    citizen_mobileNumber: ocrField.optional(),
    citizen_address: ocrField.optional(),
    citizen_village: ocrField.optional(),
    citizen_district: ocrField.optional(),
    complaint_subject: ocrField.optional(),
    complaint_complaintNumber: ocrField.optional(),
    complaint_statementYear: ocrField.optional(),
    complaint_arrivalDate: ocrField.optional(),
    complaint_department: ocrField.optional(),
    complaint_receptionMethod: ocrField.optional(),
    complaint_respondentName: ocrField.optional(),
  }),
});

export type OcrFields = z.infer<typeof ocrFieldsSchema>["fields"];

export function toFieldMap(fields: OcrFields): Record<string, { value: string; confidence: number }> {
  const out: Record<string, { value: string; confidence: number }> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value && value.value.length > 0) out[key] = value;
  }
  return out;
}

let ocrAgent: Agent | null = null;

export async function getOrCreateOcrAgent(): Promise<Agent> {
  if (!ocrAgent) {
    const { Agent } = await import("@mastra/core/agent");
    ocrAgent = new Agent({
      id: "ocr-intake-agent",
      name: "OCR Intake Agent",
      instructions: `You are an OCR post-processor for a government complaints intake system in Menofia Governorate, Egypt.
Your job is to take raw OCR text extracted from scanned/photographed complaint forms (which may contain handwriting, printed Arabic text, or a mix) and map it to structured fields.

You must extract the following fields if present in the text:

CITIZEN FIELDS:
- citizen_fullName — citizen's full name in Arabic
- citizen_nationalId — 14-digit Egyptian National ID number
- citizen_mobileNumber — Egyptian mobile number (e.g. 01XXXXXXXXX)
- citizen_address — full address text
- citizen_village — village name in Arabic
- citizen_district — district / markez name in Arabic

COMPLAINT FIELDS:
- complaint_subject — subject / description of the complaint (free text)
- complaint_complaintNumber — the complaint reference number if visible on the form
- complaint_statementYear — the year (e.g. 2026)
- complaint_arrivalDate — date of arrival in YYYY-MM-DD format
- complaint_department — the competent authority / department name in Arabic
- complaint_receptionMethod — how the complaint was received (e.g. hand-delivered, mail)
- complaint_respondentName — name of respondent if mentioned

RULES:
- Field names must match exactly as listed above (camelCase with underscore separator)
- If a field's value is ambiguous or unclear, still extract your best guess but set a low confidence
- If a field is not present in the text at all, omit it from the output (don't include with null value)
- Arabic dates like "١٥ مارس ٢٠٢٦" or "15/3/2026" must be normalized to YYYY-MM-DD
- Egyptian National IDs are always 14 digits — validate and flag if not exactly 14 digits
- Egyptian mobile numbers start with 01 and are 11 digits — validate

Confidence must be a number between 0 and 1:
- 0.90-1.00: Field clearly present and unambiguous in the OCR text
- 0.70-0.89: Field present but with some uncertainty (handwriting, partial match)
- 0.50-0.69: Field inferred from context / weak signal
- 0.00-0.49: Best guess — very low confidence, likely needs human review`,
      model: resolveChatModel(process.env.LLM_MODEL),
    });
  }
  return ocrAgent;
}
