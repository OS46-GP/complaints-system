import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitComplaintResponse,
  type ComplaintResponsePayload,
} from "@/features/complaint-response/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useSubmitComplaintResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ComplaintResponsePayload }) =>
      submitComplaintResponse(id, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(variables.id) });
    },
  });
}
