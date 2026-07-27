export const CASE_STATUS_MAPPING: Record<string, "FINISHED" | "NOT_FINISHED"> = {
  "قيد الفحص": "NOT_FINISHED",
  "تم الفحص": "FINISHED",
  "مستوفي": "FINISHED",
  "غير مستوفي": "FINISHED",
};

const FINISHED_IDS = new Set([2, 3, 4]);

export function computeCaseStatus(examinationStatusId: number | null | undefined): "FINISHED" | "NOT_FINISHED" {
  if (examinationStatusId == null) return "NOT_FINISHED";
  return FINISHED_IDS.has(examinationStatusId) ? "FINISHED" : "NOT_FINISHED";
}
