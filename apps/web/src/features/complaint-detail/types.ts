export type AssignmentStatus =
  | "RESPONDED"
  | "ACTIVE"
  | "OVERDUE"
  | "ENDED_WITHOUT_RESPONSE"
  | "ENDED_WITH_RESPONSE";

export interface DepartmentAssignment {
  id: string;
  assignmentIndex: number;
  departmentId: string;
  departmentName: string;
  departmentSubAuthority: string | null;
  outgoingLetterNumber: string | null;
  outgoingLetterDate: string | null;
  responseDeadlineDays: number | null;
  responseText: string | null;
  responseNumber: string | null;
  responseDate: string | null;
  importDate: string | null;
  examinationStatusName: string | null;
  examinationResult: string | null;
  respondedAt: string | null;
  createdAt: string;
  endedAt: string | null;
  status: AssignmentStatus;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  assignmentStatus: AssignmentStatus;
  assignmentId: string | null;
  assignmentIndex: number | null;
  responseText: string | null;
  responseNumber: string | null;
  responseDate: string | null;
  importDate: string | null;
  examinationStatusName: string | null;
  examinationResult: string | null;
  respondedAt: string | null;
  outgoingLetterNumber: string | null;
  outgoingLetterDate: string | null;
  responseDeadlineDays: number | null;
  endedAt: string | null;
}

export interface ComplaintDetailsData {
  id: string;
  displayId: string;
  complaintNumber: number;
  statementYear: number;
  arrivalDate: string;
  severity: "Low" | "Medium" | "High";
  subject: string;
  annotation: string | null;
  authorityResponseText: string | null;
  authorityResponseDate: string | null;
  incomingResponseNumber: string | null;
  archiveNumber: string | null;
  archiveDate: string | null;
  archiveLocation: string | null;
  caseStatus: "FINISHED" | "NOT_FINISHED" | null;
  citizenName: string;
  citizenNationalId: string | null;
  citizenMobile: string | null;
  citizenAddress: string | null;
  citizenVillage: string | null;
  citizenDistrict: string | null;
  departments: DepartmentSummary[];
  assignmentHistory: DepartmentAssignment[];
  complaintTypeName: string | null;
  complaintTypeId: number | null;
  receptionMethodName: string | null;
  receptionMethodId: number | null;
  examinationStatusName: string | null;
  examinationStatusId: number | null;
  respondentName: string | null;
  createdBy: string | null;
  createdAt: string;
  files: ComplaintFileItem[];
}

export interface ComplaintFileItem {
  id: string;
  fileType: string;
  storageKey: string;
  uploadedAt: string;
}
