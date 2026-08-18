import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getComplaintDetails,
  getComplaintLinks,
  analyzeComplaint,
  updateComplaintSeverity,
  updateComplaintCaseStatus,
  unlinkComplaints,
  type SeverityLevel,
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(complaintId) });
    },
  });
}

export function useUpdateSeverity(complaintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (severity: SeverityLevel) => updateComplaintSeverity(complaintId, severity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(complaintId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
    },
  });
}

export function useUpdateCaseStatus(complaintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (caseStatus: "FINISHED" | "NOT_FINISHED") =>
      updateComplaintCaseStatus(complaintId, caseStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaint(complaintId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
    },
  });
}

export function useUnlinkComplaint(complaintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => unlinkComplaints(complaintId, targetId),
    onSuccess: (_data, targetId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintLinks(complaintId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaintLinks(targetId) });
    },
  });
}
