// Tool input type definition for summarize-complaint
// Used by AgentService to structure the data sent to the AI model.

export interface SummarizeComplaintInput {
  complaintNumber: string;
  statementYear: number;
  subject: string;
  citizenName: string;
  citizenNationalId?: string;
  citizenVillage?: string;
  departmentName?: string;
  examinationStatusName?: string;
  examinationResult?: string;
  annotation?: string;
  arrivalDate: string;
}
