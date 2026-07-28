import { axiosClient } from "@/api/axios-client";
import type { CreateUserPayload } from "@/features/user-create/types";
import type { ApiUser } from "@/features/user-list/types";

export const usersApi = {
  create: (payload: CreateUserPayload) =>
    axiosClient.post("/api/users", payload).then((res) => res.data),
  list: (params?: { search?: string; role?: string }) =>
    axiosClient
      .get<ApiUser[]>("/api/users", { params })
      .then((res) => res.data),
  remove: (id: string) =>
    axiosClient.delete(`/api/users/${id}`).then((res) => res.data),
};
