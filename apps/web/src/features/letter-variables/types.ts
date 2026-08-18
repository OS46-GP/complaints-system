export type LetterVariableType = "text" | "textarea" | "date" | "image";

export const LETTER_VARIABLE_TYPE_LABELS: Record<LetterVariableType, string> = {
  text: "نص",
  textarea: "نص طويل",
  date: "تاريخ",
  image: "صورة",
};

export type LetterVariableBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export const LETTER_VARIABLE_TYPE_BADGE_VARIANTS: Record<
  LetterVariableType,
  LetterVariableBadgeVariant
> = {
  text: "secondary",
  textarea: "outline",
  date: "default",
  image: "destructive",
};

export const LETTER_VARIABLE_NOW = "NOW";

export function formatLetterVariableDefaultValue(
  variable: Pick<
    LetterVariable,
    "defaultValue" | "type" | "imageUrl" | "fallbackText"
  >,
): string {
  if (variable.type === "image") {
    if (variable.imageUrl?.trim()) {
      return variable.fallbackText?.trim()
        ? `صورة + ${variable.fallbackText}`
        : "صورة";
    }
    return variable.fallbackText?.trim() || "—";
  }
  if (variable.defaultValue?.trim() === LETTER_VARIABLE_NOW) {
    return "الوقت الحالي (عند الإصدار)";
  }
  return variable.defaultValue?.trim() || "—";
}

export interface LetterVariable {
  id: string;
  key: string;
  labelAr: string;
  type: LetterVariableType;
  defaultValue: string | null;
  imageUrl: string | null;
  fallbackText: string | null;
  required: boolean;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LetterVariablePlaceholder {
  id: string;
  key: string;
  label: string;
  type: LetterVariableType;
  required: boolean;
  defaultValue: string | null;
  imageUrl: string | null;
  fallbackText: string | null;
}

export interface CreateLetterVariablePayload {
  key: string;
  labelAr: string;
  type?: LetterVariableType;
  defaultValue?: string;
  imageUrl?: string;
  fallbackText?: string;
  required?: boolean;
  isActive?: boolean;
}

export type UpdateLetterVariablePayload = Partial<
  Omit<CreateLetterVariablePayload, "key">
>;