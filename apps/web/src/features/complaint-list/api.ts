import { axiosClient } from "@/api/axios-client";
import type { ApiComplaint, ApiCitizen, PaginatedComplaintResponse, Department, ReferenceItem, LocationItem, RecurrenceMatch, CheckDuplicatesPayload } from "@/features/complaint-list/types";

export interface ListComplaintsParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  citizenNationalId?: string;
  citizenFullName?: string;
  name?: string;
  complaintNumber?: number;
  statementYear?: number;
  severity?: "Low" | "Medium" | "High";
  complaintTypeId?: number;
  examinationStatusId?: number;
  receptionMethodId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type UpdateComplaintPayload = Omit<Partial<CreateComplaintPayload>, "citizen"> & {
  citizen?: Partial<CreateComplaintPayload["citizen"]>;
};

export interface DepartmentResponsePayload {
  responseText: string;
  responseNumber?: string;
  responseDate?: string;
  examinationStatusId?: number;
  examinationResult?: string;
  outgoingLetterNumber?: string;
  outgoingLetterDate?: string;
  responseDeadlineDays?: number;
}

export interface DepartmentAssignmentPayload {
  departmentId: string;
  outgoingLetterNumber?: string;
  outgoingLetterDate?: string;
  responseDeadlineDays?: number;
}

export interface CreateComplaintPayload {
  statementYear: number;
  arrivalDate: string;
  severity?: "Low" | "Medium" | "High";
  receptionMethodId?: number;
  complaintTypeId?: number;
  subject: string;
  respondentName?: string;
  departmentId?: string;
  departmentIds?: string[];
  departments?: DepartmentAssignmentPayload[];
  annotation?: string;
  examinationStatusId?: number;
  examinationResult?: string;
  authorityResponseText?: string;
  authorityResponseDate?: string;
  incomingResponseNumber?: string;
  archiveNumber?: string;
  archiveDate?: string;
  archiveLocation?: string;
  citizen: {
    fullName: string;
    nationalId?: string;
    mobileNumber?: string;
    address?: string;
    village?: string;
    district?: string;
  };
}

export const complaintsApi = {
  list: (params?: ListComplaintsParams) =>
    axiosClient
      .get<PaginatedComplaintResponse>("/api/complaints", { params })
      .then((res) => res.data),
  getById: (id: string) =>
    axiosClient.get<ApiComplaint>(`/api/complaints/${id}`).then((res) => res.data),
  remove: (id: string) =>
    axiosClient.delete(`/api/complaints/${id}`).then((res) => res.data),
  generatePdf: (id: string) =>
    axiosClient
      .post<{ downloadUrl: string; filename: string; mime: string }>(`/api/complaints/${id}/pdf`)
      .then((res) => res.data),
  create: (payload: CreateComplaintPayload) =>
    axiosClient.post("/api/complaints", payload).then((res) => res.data),
  update: (id: string, payload: UpdateComplaintPayload) =>
    axiosClient.patch(`/api/complaints/${id}`, payload).then((res) => res.data),
  submitDepartmentResponse: (
    id: string,
    departmentId: string,
    payload: DepartmentResponsePayload,
  ) =>
    axiosClient
      .post<ApiComplaint>(`/api/complaints/${id}/departments/${departmentId}/response`, payload)
      .then((res) => res.data),
  reassignComplaint: (
    id: string,
    departmentId: string,
    payload?: {
      outgoingLetterNumber?: string;
      outgoingLetterDate?: string;
      responseDeadlineDays?: number;
    },
  ) =>
    axiosClient
      .post<ApiComplaint>(`/api/complaints/${id}/reassign`, {
        departmentId,
        ...(payload ?? {}),
      })
      .then((res) => res.data),
  sendUrgency: (
    id: string,
    departmentId: string,
    payload: {
      outgoingLetterNumber: string;
      outgoingLetterDate: string;
    },
  ) =>
    axiosClient
      .post<ApiComplaint>(`/api/complaints/${id}/urgency`, {
        departmentId,
        ...payload,
      })
      .then((res) => res.data),
  getDepartments: () =>
    axiosClient.get<Department[]>("/api/complaints/departments").then((res) => res.data),
  getComplaintTypes: () =>
    axiosClient.get<ReferenceItem[]>("/api/complaints/complaint-types").then((res) => res.data),
  getReceptionMethods: () =>
    axiosClient.get<ReferenceItem[]>("/api/complaints/reception-methods").then((res) => res.data),
  getExaminationStatuses: () =>
    axiosClient.get<ReferenceItem[]>("/api/complaints/examination-statuses").then((res) => res.data),
  getLocations: () =>
    axiosClient.get<LocationItem[]>("/api/complaints/locations").then((res) => res.data),
  getCitizenByNationalId: (nationalId: string) =>
    axiosClient
      .get<ApiCitizen | null>(`/api/complaints/citizens/${encodeURIComponent(nationalId)}`)
      .then((res) => res.data),
  findCitizensByName: (name: string) =>
    axiosClient
      .get<ApiCitizen[]>(`/api/complaints/citizens/by-name/${encodeURIComponent(name)}`)
      .then((res) => res.data),
  checkDuplicates: (payload: CheckDuplicatesPayload) =>
    axiosClient
      .post<{ severity: "LOW" | "MEDIUM" | "HIGH"; recurrenceMatches: RecurrenceMatch[] }>("/api/complaints/check-duplicates", payload)
      .then((res) => res.data),
  analyze: (id: string) =>
    axiosClient
      .post<{ severity: "LOW" | "MEDIUM" | "HIGH"; recurrenceMatches: RecurrenceMatch[] }>(`/api/complaints/${id}/analyze`)
      .then((res) => res.data),
  updateSeverity: (id: string, severity: "LOW" | "MEDIUM" | "HIGH") =>
    axiosClient
      .patch<{ severity: "LOW" | "MEDIUM" | "HIGH" }>(`/api/complaints/${id}/severity`, { severity })
      .then((res) => res.data),
  summarize: (id: string) =>
    axiosClient
      .post<{ draft: string }>(`/api/ai/summarize/${id}`)
      .then((res) => res.data),
  summarizeBatch: (complaintIds: string[]) =>
    axiosClient
      .post<{ draft: string }>("/api/ai/summarize-batch", { complaintIds })
      .then((res) => res.data),
  draftSelectionReport: (complaintIds: string[]) =>
    axiosClient
      .post<{ draft: string }>("/api/ai/draft-selection-report", { complaintIds })
      .then((res) => res.data),
  getLinks: (id: string) =>
    axiosClient
      .get<{ severity: string; recurrenceMatches: RecurrenceMatch[] }>(`/api/complaints/${id}/links`)
      .then((res) => res.data),
  unlinkComplaints: (id: string, targetId: string) =>
    axiosClient
      .delete<{ unlinked: boolean }>(`/api/complaints/${id}/links/${targetId}`)
      .then((res) => res.data),
};
