import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  reassignComplaintToDepartment,
  type ReassignComplaintPayload,
} from "@/features/complaint-reassign/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useReassignComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      departmentId,
      payload,
    }: {
      id: string;
      departmentId: string;
      payload: ReassignComplaintPayload;
    }) => reassignComplaintToDepartment(id, departmentId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintLinks(variables.id) });
    },
  });
}