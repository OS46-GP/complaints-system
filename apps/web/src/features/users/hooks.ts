import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "@/features/users/api";
import { mapApiUser } from "@/features/users/types";
import type { UserFormData } from "@/features/users/types";
import type { UserEditFormData } from "@/features/users/types";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useUsers(params?: { search?: string; role?: string }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.list(params),
    select: (data) => data.map(mapApiUser),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user(userId),
    queryFn: () => usersApi.getById(userId),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: UserFormData) =>
      usersApi.create({
        username: formData.username,
        password: formData.password,
        role: formData.role,
        nationalId: formData.nationalId || undefined,
        email: formData.email || undefined,
        fullName: undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: UserEditFormData) =>
      usersApi.update(userId, {
        password: formData.password || undefined,
        role: formData.role,
        nationalId:
          formData.nationalId && !formData.nationalId.startsWith("****")
            ? formData.nationalId
            : undefined,
        email: formData.email || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.remove(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}
