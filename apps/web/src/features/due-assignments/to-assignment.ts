import type { DepartmentAssignment } from "@/features/complaint-detail/types";
import type { DueAssignmentRow } from "@/features/complaint-list/types";

export function toAssignment(row: DueAssignmentRow): DepartmentAssignment {
  return {
    id: row.assignmentId,
    assignmentIndex: row.assignmentIndex,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    departmentSubAuthority: row.departmentSubAuthority,
    outgoingLetterNumber: row.outgoingLetterNumber,
    outgoingLetterDate: row.outgoingLetterDate,
    responseDeadlineDays: row.responseDeadlineDays,
    responseText: null,
    responseNumber: null,
    responseDate: null,
    importDate: null,
    examinationStatusName: null,
    examinationResult: null,
    respondedAt: null,
    createdAt: row.createdAt,
    endedAt: null,
    status: row.status,
  };
}

export function displayId(row: DueAssignmentRow): string {
  return `#${row.complaintNumber}-${row.statementYear}`;
}

export function complaintDetailHref(complaintId: string, currentPath: string): string {
  return currentPath.startsWith("/admin")
    ? `/admin/complaints/${complaintId}`
    : `/user/complaints/${complaintId}`;
}