import { axiosClient } from "./axios-client.ts";

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth-types";
import type { ApiResponse } from "@/types/common-types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      payload,
    );
    return data.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      payload,
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post("/auth/logout");
  },

  me: async () => {
    const { data } =
      await axiosClient.get<ApiResponse<AuthResponse["user"]>>("/auth/me");
    return data.data;
  },

  refresh: async (
    refreshToken: string,
  ): Promise<Pick<AuthResponse, "accessToken">> => {
    const { data } = await axiosClient.post<
      ApiResponse<Pick<AuthResponse, "accessToken">>
    >("/auth/refresh", { refreshToken });
    return data.data;
  },
};
