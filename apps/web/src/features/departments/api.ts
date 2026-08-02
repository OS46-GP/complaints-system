import { axiosClient } from "@/api/axios-client";
import type { ApiDepartment } from "@/features/departments/types";

export interface CreateDepartmentPayload {
  name: string;
  subAuthority?: string;
}

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

export interface ListDepartmentsParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const departmentsApi = {
  create: (payload: CreateDepartmentPayload) =>
    axiosClient.post("/api/departments", payload).then((res) => res.data),
  list: (params?: ListDepartmentsParams) =>
    axiosClient
      .get<ApiDepartment[]>("/api/departments", { params })
      .then((res) => res.data),
  getById: (id: string) =>
    axiosClient
      .get<ApiDepartment>(`/api/departments/${id}`)
      .then((res) => res.data),
  update: (id: string, payload: UpdateDepartmentPayload) =>
    axiosClient.patch(`/api/departments/${id}`, payload).then((res) => res.data),
  remove: (id: string) =>
    axiosClient.delete(`/api/departments/${id}`).then((res) => res.data),
};
