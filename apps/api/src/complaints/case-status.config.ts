export const CASE_STATUS_MAPPING: Record<string, "FINISHED" | "NOT_FINISHED"> = {
  "قيد الفحص": "NOT_FINISHED",
  "تم الفحص": "FINISHED",
  "مستوفي": "FINISHED",
  "غير مستوفي": "FINISHED",
  "منتهي": "FINISHED",
  "غير منتهي": "NOT_FINISHED",
};

export function computeCaseStatus(examinationStatusName: string | null | undefined): "FINISHED" | "NOT_FINISHED" {
  if (!examinationStatusName) return "NOT_FINISHED";
  return CASE_STATUS_MAPPING[examinationStatusName] ?? "NOT_FINISHED";
}
