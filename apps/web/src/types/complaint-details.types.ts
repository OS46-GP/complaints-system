export interface ComplaintDetailsData {
  id: string;
  complaintNumber: string;
  statementYear: number;
  arrivalDate: string;
  status: string;
  severity: "High" | "Medium" | "Low";
  receptionMethodId: string;
  complaintTypeId: string;
  subject: string;
  respondentName: string;
  departmentId: string;
  presentationStatusId: string;
  annotation: string;
  examinationStatusId: string;
  examinationResult: string;
  authorityResponseText: string;
  authorityResponseDate: string;
  outgoingLetterNumber: string;
  outgoingLetterDate: string;
  incomingResponseNumber: string;
  notificationMethod: string;
  notificationOutNumber: string;
  notificationOutDate: string;
  archiveNumber: string;
  archiveDate: string;
  archiveLocation: string;
  weeklyMeeting: number | null;
  finalDecisionDate: string;
  endDate: string;
  citizenId: string;
  files: ComplaintFileItem[];
  actions: ComplaintActionItem[];
  escalations: ComplaintEscalationItem[];
}

export interface ComplaintFileItem {
  id: string;
  fileType: string;
  storageKey: string;
  uploadedAt: string;
}

export interface ComplaintActionItem {
  id: string;
  action: string;
  actionDate: string;
  notes: string;
  createdAt: string;
}

export interface ComplaintEscalationItem {
  id: string;
  urgencyNumber: string;
  urgencyDate: string;
  responseDate: string;
  createdAt: string;
}
