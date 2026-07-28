import { axiosClient } from "@/api/axios-client";
import type { ApiComplaint, PaginatedComplaintResponse, Department, ReferenceItem } from "@/features/complaint-list/types";

export interface ListComplaintsParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  name?: string;
  complaintNumber?: number;
  statementYear?: number;
}

export type UpdateComplaintPayload = Omit<Partial<CreateComplaintPayload>, "citizen"> & {
  citizen?: Partial<CreateComplaintPayload["citizen"]>;
};

export interface CreateComplaintPayload {
  statementYear: number;
  arrivalDate: string;
  severity?: "Low" | "Medium" | "High";
  receptionMethodId?: number;
  complaintTypeId?: number;
  subject: string;
  respondentName?: string;
  departmentId?: string;
  presentationStatusId?: number;
  annotation?: string;
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
  create: (payload: CreateComplaintPayload) =>
    axiosClient.post("/api/complaints", payload).then((res) => res.data),
  update: (id: string, payload: UpdateComplaintPayload) =>
    axiosClient.patch(`/api/complaints/${id}`, payload).then((res) => res.data),
  getDepartments: () =>
    axiosClient.get<Department[]>("/api/complaints/departments").then((res) => res.data),
  getComplaintTypes: () =>
    axiosClient.get<ReferenceItem[]>("/api/complaints/complaint-types").then((res) => res.data),
  getReceptionMethods: () =>
    axiosClient.get<ReferenceItem[]>("/api/complaints/reception-methods").then((res) => res.data),
  getPresentationStatuses: () =>
    axiosClient.get<ReferenceItem[]>("/api/complaints/presentation-statuses").then((res) => res.data),
};
