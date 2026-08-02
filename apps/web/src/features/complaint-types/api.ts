import { axiosClient } from "@/api/axios-client";
import type { ApiComplaintType } from "@/features/complaint-types/types";

export interface CreateComplaintTypePayload {
  name: string;
}

export type UpdateComplaintTypePayload = Partial<CreateComplaintTypePayload>;

export const complaintTypesApi = {
  create: (payload: CreateComplaintTypePayload) =>
    axiosClient.post("/api/complaint-types", payload).then((res) => res.data),
  list: (params?: { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" }) =>
    axiosClient
      .get<ApiComplaintType[]>("/api/complaint-types", { params })
      .then((res) => res.data),
  getById: (id: number) =>
    axiosClient
      .get<ApiComplaintType>(`/api/complaint-types/${id}`)
      .then((res) => res.data),
  update: (id: number, payload: UpdateComplaintTypePayload) =>
    axiosClient.patch(`/api/complaint-types/${id}`, payload).then((res) => res.data),
  remove: (id: number) =>
    axiosClient.delete(`/api/complaint-types/${id}`).then((res) => res.data),
};
