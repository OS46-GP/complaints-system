export type LetterTemplateType = "HTML" | "DOCX";

export const LETTER_TYPE_LABELS: Record<LetterTemplateType, string> = {
  HTML: "HTML",
  DOCX: "DOCX",
};

export interface LetterTemplate {
  id: string;
  name: string;
  description: string | null;
  type: LetterTemplateType;
  body: string | null;
  assetKey: string | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLetterTemplatePayload {
  name: string;
  description?: string;
  type: LetterTemplateType;
  body?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

export type UpdateLetterTemplatePayload = Partial<CreateLetterTemplatePayload>;

export interface PlaceholderItem {
  key: string;
  label: string;
}

export interface PlaceholderGroup {
  group: string;
  label: string;
  items: PlaceholderItem[];
}

export interface GeneratedLetter {
  id: string;
  templateId: string;
  templateName: string;
  type: LetterTemplateType;
  downloadUrl: string;
  generatedAt: string;
}

export interface GenerateLetterResult {
  downloadUrl: string;
  filename: string;
  mime: string;
  templateId: string;
  templateName: string;
}