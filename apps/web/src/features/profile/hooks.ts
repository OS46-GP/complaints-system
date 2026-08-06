import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { profileApi } from "@/features/profile/api";
import type { UpdateProfilePayload } from "@/features/profile/types";

export const PROFILE_KEYS = {
  profile: ["profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEYS.profile,
    queryFn: profileApi.getMe,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_KEYS.profile, data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
  });
}
