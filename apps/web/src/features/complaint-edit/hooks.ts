import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateComplaint } from "@/features/complaint-edit/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";

export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ComplaintCreateFormData }) =>
      updateComplaint(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(variables.id) });
    },
  });
}
