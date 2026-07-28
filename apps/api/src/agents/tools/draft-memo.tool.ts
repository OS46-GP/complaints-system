// Tool input type definition for draft-memo
// Used by AgentService to structure complaint data sent to the AI model.

export interface DraftMemoInput {
  complaintNumber: string;
  statementYear: number;
  subject: string;
  citizenName: string;
  citizenAddress?: string;
  citizenVillage?: string;
  departmentName?: string;
  examinationResult?: string;
  outgoingLetterNumber?: string;
  memoDate: string;
  governorateName?: string;
}
