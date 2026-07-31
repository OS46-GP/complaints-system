import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitComplaintArchive,
  type ComplaintArchivePayload,
} from "@/features/complaint-archive/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useArchiveComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ComplaintArchivePayload }) =>
      submitComplaintArchive(id, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(variables.id) });
    },
  });
}
