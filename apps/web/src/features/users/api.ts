import { axiosClient } from "@/api/axios-client";
import type { CreateUserPayload } from "@/features/user-create/types";

export const usersApi = {
  create: (payload: CreateUserPayload) =>
    axiosClient.post("/api/users", payload).then((res) => res.data),
};
