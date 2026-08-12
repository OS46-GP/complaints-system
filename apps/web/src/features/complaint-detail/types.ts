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
  departments: { id: string; name: string }[];
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
