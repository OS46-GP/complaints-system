import type { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { resolveChatModel } from "../../common/llm/model-provider";

const ocrField = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Department/authority lookup list injected into the agent at request time,
 * so it can resolve a name mentioned on the form to a real department id.
 */
export interface OcrDepartmentReference {
  id: string;
  name: string;
  subAuthority?: string | null;
}

/**
 * Complaint category / type lookup list injected into the agent at request
 * time, so it can classify the complaint into a real complaint type id.
 */
export interface OcrComplaintTypeReference {
  id: number;
  name: string;
}

export const ocrFieldsSchema = z.object({
  fields: z.object({
    citizen_fullName: ocrField.optional(),
    citizen_nationalId: ocrField.optional(),
    citizen_mobileNumber: ocrField.optional(),
    citizen_address: ocrField.optional(),
    citizen_village: ocrField.optional(),
    citizen_district: ocrField.optional(),
    complaint_subject: ocrField.optional(),
    complaint_annotation: ocrField.optional(),
    complaint_complaintNumber: ocrField.optional(),
    complaint_statementYear: ocrField.optional(),
    complaint_arrivalDate: ocrField.optional(),
    complaint_type: ocrField.optional(),
    complaint_typeId: ocrField.optional(),
    complaint_department: ocrField.optional(),
    complaint_departmentId: ocrField.optional(),
    complaint_receptionMethod: ocrField.optional(),
    complaint_respondentName: ocrField.optional(),
  }),
});

export type OcrFields = z.infer<typeof ocrFieldsSchema>["fields"];

export const MAX_OCR_TEXT_LENGTH = 12_000;

/**
 * Deterministic post-processing pass over the raw agent output. Validates
 * well-known formats, clamps confidence to [0,1], and flags invalid values by
 * lowering their confidence so the frontend visually marks them for review.
 */
export function sanitizeFields(
  raw: OcrFields,
): Record<string, { value: string; confidence: number }> {
  const clamp = (confidence: number) => Math.max(0, Math.min(1, confidence));
  const toDigits = (s: string) => s.replace(/\D/g, "");

  const out: Record<string, { value: string; confidence: number }> = {};
  for (const [key, rawField] of Object.entries(raw)) {
    if (!rawField || !rawField.value.trim()) continue;

    let { value, confidence } = rawField;
    confidence = clamp(confidence);

    if (key === "citizen_nationalId") {
      const digits = toDigits(value);
      if (digits.length !== 14) {
        confidence = Math.min(confidence, 0.3);
      } else {
        value = digits;
      }
    } else if (key === "citizen_mobileNumber") {
      const digits = toDigits(value);
      if (!/^01[0125]\d{8}$/.test(digits)) {
        confidence = Math.min(confidence, 0.3);
      }
    } else if (key === "complaint_statementYear") {
      const match = value.match(/\d{4}/);
      if (match) value = match[0];
      if (!/^20\d{2}$/.test(value)) confidence = Math.min(confidence, 0.3);
    } else if (key === "complaint_arrivalDate") {
      const match = value.match(/\d{4}-\d{2}-\d{2}/);
      if (match) value = match[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) confidence = Math.min(confidence, 0.3);
    }

    if (value.trim()) out[key] = { value: value.trim(), confidence };
  }
  return out;
}

export function toFieldMap(
  fields: OcrFields,
): Record<string, { value: string; confidence: number }> {
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
      instructions: `You are an OCR post-processor for a government complaint intake system in Menofia Governorate, Egypt.
Your job is to take raw OCR text extracted from scanned/photographed complaint forms (which may contain handwriting, printed Arabic text, or a mix) and map it to the structured fields of the official complaint form.

The official complaint form contains the following fields (Arabic labels in parentheses):

CITIZEN FIELDS:
- citizen_fullName (اسم المواطن رباعي) — citizen's full four-part name
- citizen_nationalId (الرقم القومي) — 14-digit Egyptian National ID
- citizen_mobileNumber (رقم الهاتف المحمول) — Egyptian mobile (01XXXXXXXXX)
- citizen_address (العنوان) — full address text
- citizen_village (القرية) — village name
- citizen_district (المركز / الوحدة المحلية) — district / markez name

COMPLAINT FIELDS:
- complaint_subject (موضوع الشكوى) — a SHORT subject line / headline of the complaint, at most 8-15 words, summarizing the core issue. This is displayed prominently in lists, so keep it concise — never paste the full text of the complaint here.
- complaint_annotation (الوصف التفصيلي للشكوى) — the full detailed description of the complaint in the citizen's own words. This is where the complete complaint body goes (typed or handwritten). If the form contains a long free-text section, put ALL of it here, preserving the citizen's own phrasing and ordering.
- complaint_complaintNumber (رقم الشكوى) — complaint reference number if printed on the form
- complaint_statementYear (سنة البيان) — the statement year, a 4-digit year
- complaint_arrivalDate (تاريخ الورود) — arrival date, normalized to YYYY-MM-DD
- complaint_type (فئة الشكوى) — the complaint category, chosen ONLY from the complaint types list supplied in the request
- complaint_typeId (internal id) — the id of the matched complaint type for complaint_type, chosen ONLY from the complaint types list supplied in the request
- complaint_department (الجهة المعنية / جهة الشكوى) — the competent authority as written, in Arabic
- complaint_departmentId (internal id) — the id of the matched department for the value of complaint_department, chosen ONLY from the authoritative department list supplied in the request
- complaint_receptionMethod (طريقة وصول الشكوى) — hand-delivered, mail, phone, etc.
- complaint_respondentName (اسم مقدم الشكوى) — name of the respondent if mentioned

COMPLAINT TYPE RESOLUTION RULES:
- In the request message you will receive a JSON array "complaintTypes" with objects {id, name}. Use it ONLY to resolve complaint_type and complaint_typeId.
- Classify the complaint into the single most appropriate category from that list (e.g. خدمة، مالي، مرافق، صحة، تعليم، زراعة، بيئة، طرق، أمن). Base the decision on the full complaint text.
- Set complaint_type to the matched entry's name and complaint_typeId to its id. Lower confidence (0.50-0.69) when the category is ambiguous.
- If the form explicitly states a category that is not in the list, prefer the closest matching entry from the list rather than omitting it.
- Never invent a complaint type id that is not present in the list.

DEPARTMENT RESOLUTION RULES:
- In the request message you will receive a JSON array "departments" with objects {id, name, subAuthority}. Use it ONLY to resolve complaint_departmentId.
- If the authority written on the form clearly matches one entry in that list (name or subAuthority), set complaint_department to the matched entry's name and complaint_departmentId to its id with high confidence.
- If the authority written on the form is a department that is not in the list, resolve it to the CLOSEST entry in the list by meaning/scope (e.g. "مديرية حماية المستهلك" → "مديرية التموين والتجارة الداخلية") and set complaint_departmentId to that entry's id with medium confidence (0.50-0.69), keeping complaint_department as the closest entry's name.
- If the authority written on the form is clearly unrelated to every entry in the list (e.g. a private company, an individual, a shop name), set complaint_department to your best guess WITHOUT complaint_departmentId.
- Never invent a department id that is not present in the list.

GENERAL RULES:
- Field names must match exactly as listed above (camelCase with underscore separator)
- If a value is ambiguous or unclear, still extract your best guess but set a low confidence
- If a field is not present in the text at all, omit it from the output (don't include with null value)
- Arabic dates like "١٥ مارس ٢٠٢٦" or "15/3/2026" must be normalized to YYYY-MM-DD
- Egyptian National IDs are always 14 digits — reduce confidence if the OCR output is short
- Egyptian mobile numbers start with 01 and are 11 digits — reduce confidence otherwise

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