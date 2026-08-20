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

export function computeLateDays(assignment: {
  outgoingLetterDate: string | null;
  responseDeadlineDays: number | null;
  importDate: string | null;
  responseDate: string | null;
  respondedAt: string | null;
}): number | null {
  const due = computeDueDate(assignment);
  if (!due) return null;
  const received = assignment.importDate ?? assignment.responseDate ?? assignment.respondedAt;
  if (!received) return null;
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const receivedDate = new Date(received);
  const receivedDay = new Date(
    receivedDate.getFullYear(),
    receivedDate.getMonth(),
    receivedDate.getDate(),
  );
  const lateMs = receivedDay.getTime() - dueDay.getTime();
  if (lateMs <= 0) return null;
  return Math.round(lateMs / (1000 * 60 * 60 * 24));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-SA");
}