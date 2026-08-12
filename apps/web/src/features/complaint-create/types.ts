export interface FileItem {
  file: File;
  id: string;
}

export interface DepartmentAssignmentFormValue {
  departmentId: string;
  outgoingLetterNumber: string;
  outgoingLetterDate: string;
  responseDeadlineDays: string;
}

export interface ComplaintCreateFormData {
  subject: string;
  complaintTypeId: string;
  severity?: "Low" | "Medium" | "High";
  receptionMethodId: string;
  departments: DepartmentAssignmentFormValue[];
  annotation: string;
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