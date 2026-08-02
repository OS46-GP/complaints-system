import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { complaintTypesApi } from "@/features/complaint-types/api";
import type { ComplaintType } from "@/features/complaint-types/types";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export interface ComplaintTypesListParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useComplaintTypesList(params?: ComplaintTypesListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.complaintTypes, params],
    queryFn: () => complaintTypesApi.list(params),
    select: (data): ComplaintType[] => data,
  });
}

export function useCreateComplaintType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => complaintTypesApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintTypes });
    },
  });
}

export function useUpdateComplaintType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      complaintTypesApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintTypes });
    },
  });
}

export function useDeleteComplaintType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => complaintTypesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintTypes });
    },
  });
}
