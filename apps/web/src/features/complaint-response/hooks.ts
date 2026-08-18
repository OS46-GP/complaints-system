import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitDepartmentResponse,
  type ComplaintResponsePayload,
} from "@/features/complaint-response/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useSubmitComplaintResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      departmentId,
      payload,
    }: {
      id: string;
      departmentId: string;
      payload: ComplaintResponsePayload;
    }) => submitDepartmentResponse(id, departmentId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(variables.id) });
    },
  });
}