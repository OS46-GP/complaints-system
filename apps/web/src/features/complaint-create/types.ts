export interface FileItem {
  file: File;
  id: string;
}

export interface ComplaintCreateFormData {
  subject: string;
  complaintTypeId: string;
  severity?: "Low" | "Medium" | "High";
  receptionMethodId: string;
  respondentName: string;
  departmentId: string;
  annotation: string;
  presentationStatusId: string;
  citizen: {
    fullName: string;
    nationalId: string;
    mobileNumber: string;
    address: string;
    village: string;
    district: string;
  };
  files: File[];
}
