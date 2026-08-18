import type { AssignmentStatus } from "@/features/complaint-detail/types";

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  RESPONDED: "تم الرد",
  ACTIVE: "قيد المتابعة",
  OVERDUE: "متأخرة عن الرد",
  ENDED_WITHOUT_RESPONSE: "انتهت دون رد",
  ENDED_WITH_RESPONSE: "انتهت بعد الرد",
};

export const ASSIGNMENT_STATUS_VARIANT: Record<
  AssignmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  RESPONDED: "default",
  ACTIVE: "secondary",
  OVERDUE: "destructive",
  ENDED_WITHOUT_RESPONSE: "destructive",
  ENDED_WITH_RESPONSE: "outline",
};

export function computeDueDate(assignment: {
  outgoingLetterDate: string | null;
  responseDeadlineDays: number | null;
}): Date | null {
  if (!assignment.outgoingLetterDate || !assignment.responseDeadlineDays) return null;
  const due = new Date(assignment.outgoingLetterDate);
  due.setDate(due.getDate() + assignment.responseDeadlineDays);
  return due;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-SA");
}