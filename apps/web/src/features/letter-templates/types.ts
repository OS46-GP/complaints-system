export type LetterTemplateType = "HTML";

export const LETTER_TYPE_LABELS: Record<LetterTemplateType, string> = {
  HTML: "HTML",
};

export interface TemplateVariable {
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "textarea" | "date";
  group?: string;
}

export interface LetterTemplate {
  id: string;
  name: string;
  description: string | null;
  type: LetterTemplateType;
  body: string | null;
  variables: TemplateVariable[] | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLetterTemplatePayload {
  name: string;
  description?: string;
  type?: LetterTemplateType;
  body?: string;
  variables?: TemplateVariable[];
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
  variableValues: Record<string, string> | null;
  generatedAt: string;
}

export interface GenerateLetterResult {
  downloadUrl: string;
  filename: string;
  mime: string;
  templateId: string;
  templateName: string;
}