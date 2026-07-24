export type {
  Complaint,
  Citizen,
  User,
  Department,
  Location,
  ReceptionMethod,
  ComplaintType,
  ExaminationStatus,
  PresentationStatus,
  ComplaintAction,
  ComplaintEscalation,
  ComplaintFile,
} from "@prisma/client";

export { Severity, ComplaintStatus } from "@prisma/client";

export type CreateComplaintDto = {
  complaintNumber: string;
  statementYear: number;
  arrivalDate: string;
  citizenId: string;
  status?: "Finished" | "NotFinished";
  severity?: "Low" | "Medium" | "High";
  receptionMethodId?: number;
  complaintTypeId?: number;
  subject: string;
  respondentName?: string;
  departmentId?: string;
  presentationStatusId?: number;
  annotation?: string;
  examinationStatusId?: number;
  examinationResult?: string;
  authorityResponseText?: string;
  authorityResponseDate?: string;
  outgoingLetterNumber?: string;
  outgoingLetterDate?: string;
  incomingResponseNumber?: string;
  notificationMethod?: string;
  notificationOutNumber?: string;
  notificationOutDate?: string;
  archiveNumber?: string;
  archiveDate?: string;
  archiveLocation?: string;
  weeklyMeeting?: number;
  finalDecisionDate?: string;
  endDate?: string;
  attachmentCount?: number;
};

export type UpdateComplaintDto = Partial<CreateComplaintDto>;
