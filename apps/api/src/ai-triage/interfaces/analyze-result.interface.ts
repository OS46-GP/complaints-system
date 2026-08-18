export type SeverityLevel = "Low" | "Medium" | "High";

export interface RecurrenceMatch {
  id: string;
  complaintNumber: number;
  statementYear: number;
  arrivalDate: string;
  subject: string;
  examinationStatus: string | null;
  endDate: string | null;
  actions: {
    id: string;
    action: string;
    actionDate: string;
    notes: string | null;
  }[];
}

export interface AnalyzeResult {
  severity: SeverityLevel;
  recurrenceMatches: RecurrenceMatch[];
}

export interface RecurrenceInput {
  id?: string;
  subject: string;
  annotation?: string | null;
  departmentName?: string | null;
  complaintNumber?: number;
  statementYear: number;
  arrivalDate: Date;
  departmentId: string | null;
  citizen: {
    nationalId: string | null;
    village: string | null;
    district: string | null;
  };
  examinationStatus?: { name: string } | null;
}

export interface RecurrenceCandidate {
  id: string;
  complaintNumber: number;
  statementYear: number;
  arrivalDate: Date;
  subject: string;
  citizen: {
    nationalId: string | null;
    village: string | null;
    district: string | null;
  };
  departmentId: string | null;
  examinationStatus: { name: string } | null;
  endDate: Date | null;
  actions: {
    id: string;
    action: string;
    actionDate: Date;
    notes: string | null;
  }[];
}
