import { axiosClient } from "@/api/axios-client";
import type {
  ProfileUser,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/features/profile/types";

export const profileApi = {
  getMe: () =>
    axiosClient.get<ProfileUser>("/api/profile").then((res) => res.data),
  updateProfile: (payload: UpdateProfilePayload) =>
    axiosClient.patch<ProfileUser>("/api/profile", payload).then((res) => res.data),
  changePassword: (payload: ChangePasswordPayload) =>
    axiosClient
      .patch<{ success: boolean }>("/api/profile/password", payload)
      .then((res) => res.data),
};
