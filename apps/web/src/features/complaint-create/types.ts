export interface ComplaintCreateFormData {
  subject: string;
  complaintTypeId: string;
  severity: "High" | "Medium" | "Low";
  receptionMethodId: string;
  respondentName: string;
  departmentId: string;
  annotation: string;
  presentationStatusId: string;
  citizenId: string;
  files: File[];
}
