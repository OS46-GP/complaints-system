import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createComplaint } from "@/features/complaint-create/api";
import { complaintsApi } from "@/features/complaint-list/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ComplaintCreateFormData) => createComplaint(data),
    onSuccess: (created) => {
      if (created?.id) {
        complaintsApi.analyze(created.id).catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
    },
  });
}
