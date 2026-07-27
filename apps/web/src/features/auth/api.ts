import { axiosClient } from "@/api/axios-client";
import type { LoginPayload, AuthResponse } from "./types";

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosClient.post<AuthResponse>("/api/auth/login", payload).then((res) => res.data),
};
