import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getComplaintDetails,
  getComplaintLinks,
  analyzeComplaint,
} from "@/features/complaint-detail/api";
import { QUERY_KEYS } from "@/features/complaint-list/hooks";

export function useComplaint(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.complaint(id ?? ""),
    queryFn: () => getComplaintDetails(id!),
    enabled: !!id,
  });
}

export function useComplaintLinks(complaintId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.complaintLinks(complaintId),
    queryFn: () => getComplaintLinks(complaintId),
  });
}

export function useAnalyzeComplaint(complaintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => analyzeComplaint(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintLinks(complaintId) });
    },
  });
}
