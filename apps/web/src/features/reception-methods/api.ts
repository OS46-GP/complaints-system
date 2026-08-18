import { axiosClient } from "@/api/axios-client";
import type { ApiReceptionMethod } from "@/features/reception-methods/types";

export interface CreateReceptionMethodPayload {
  name: string;
}

export type UpdateReceptionMethodPayload = Partial<CreateReceptionMethodPayload>;

export interface ListReceptionMethodsParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const receptionMethodsApi = {
  create: (payload: CreateReceptionMethodPayload) =>
    axiosClient.post("/api/reception-methods", payload).then((res) => res.data),
  list: (params?: ListReceptionMethodsParams) =>
    axiosClient
      .get<ApiReceptionMethod[]>("/api/reception-methods", { params })
      .then((res) => res.data),
  getById: (id: number) =>
    axiosClient
      .get<ApiReceptionMethod>(`/api/reception-methods/${id}`)
      .then((res) => res.data),
  update: (id: number, payload: UpdateReceptionMethodPayload) =>
    axiosClient.patch(`/api/reception-methods/${id}`, payload).then((res) => res.data),
  remove: (id: number) =>
    axiosClient.delete(`/api/reception-methods/${id}`).then((res) => res.data),
};
