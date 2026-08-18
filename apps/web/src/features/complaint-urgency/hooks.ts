import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  sendUrgencyRequest,
  type UrgencyPayload,
} from "@/features/complaint-urgency/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useSendUrgency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      departmentId,
      payload,
    }: {
      id: string;
      departmentId: string;
      payload: UrgencyPayload;
    }) => sendUrgencyRequest(id, departmentId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintLinks(variables.id) });
    },
  });
}