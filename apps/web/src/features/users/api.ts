import { axiosClient } from "@/api/axios-client";
import type { CreateUserPayload, UpdateUserPayload, ApiUser } from "@/features/users/types";

export const usersApi = {
  create: (payload: CreateUserPayload) =>
    axiosClient.post("/api/users", payload).then((res) => res.data),
  list: (params?: { search?: string; role?: string }) =>
    axiosClient
      .get<ApiUser[]>("/api/users", { params })
      .then((res) => res.data),
  getById: (id: string) =>
    axiosClient.get<ApiUser>(`/api/users/${id}`).then((res) => res.data),
  update: (id: string, payload: UpdateUserPayload) =>
    axiosClient.patch(`/api/users/${id}`, payload).then((res) => res.data),
  remove: (id: string) =>
    axiosClient.delete(`/api/users/${id}`).then((res) => res.data),
};
