import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";

export interface ComplaintDraft {
  seedTag: string;
  values: ComplaintCreateFormValues;
  step: number;
  updatedAt: number;
}

let currentDraft: ComplaintDraft | null = null;

export function getDraft(): ComplaintDraft | null {
  return currentDraft;
}

export function setDraft(draft: ComplaintDraft): void {
  currentDraft = draft;
}

export function clearDraft(): void {
  currentDraft = null;
}
