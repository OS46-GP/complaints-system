import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { departmentsApi, type ListDepartmentsParams } from "@/features/departments/api";
import type { Department } from "@/features/departments/types";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useDepartmentsList(params?: ListDepartmentsParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.departments, params],
    queryFn: () => departmentsApi.list(params),
    select: (data): Department[] => data,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; subAuthority?: string }) =>
      departmentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.departments });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; name?: string; subAuthority?: string }) =>
      departmentsApi.update(payload.id, {
        name: payload.name,
        subAuthority: payload.subAuthority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.departments });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.departments });
    },
  });
}
