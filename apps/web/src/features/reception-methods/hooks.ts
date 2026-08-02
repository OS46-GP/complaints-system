import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { receptionMethodsApi, type ListReceptionMethodsParams } from "@/features/reception-methods/api";
import type { ReceptionMethod } from "@/features/reception-methods/types";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useReceptionMethodsList(params?: ListReceptionMethodsParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.receptionMethods, params],
    queryFn: () => receptionMethodsApi.list(params),
    select: (data): ReceptionMethod[] => data,
  });
}

export function useCreateReceptionMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => receptionMethodsApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receptionMethods });
    },
  });
}

export function useUpdateReceptionMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      receptionMethodsApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receptionMethods });
    },
  });
}

export function useDeleteReceptionMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => receptionMethodsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receptionMethods });
    },
  });
}
