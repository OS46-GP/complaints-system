import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { complaintsApi, type ListComplaintsParams } from "@/features/complaint-list/api";
import { usePreferences } from "@/features/settings/preferences/store";
import { mapApiComplaint } from "@/features/complaint-list/types";

export const QUERY_KEYS = {
  complaints: ["complaints"] as const,
  complaint: (id: string) => ["complaint", id] as const,
  complaintLinks: (id: string) => ["complaint-links", id] as const,
  departments: ["departments"] as const,
  complaintTypes: ["complaint-types"] as const,
  examinationStatuses: ["examination-statuses"] as const,
  receptionMethods: ["reception-methods"] as const,
  locations: ["locations"] as const,
  users: ["users"] as const,
  user: (id: string) => ["user", id] as const,
};

export function useComplaints(params: ListComplaintsParams) {
  return useQuery({
    queryKey: ["complaints", params],
    queryFn: () => complaintsApi.list(params),
    select: (res) => ({
      complaints: res.data.map(mapApiComplaint),
      meta: res.meta,
    }),
  });
}

export function useComplaintsFromSearchParams(
  searchParams: URLSearchParams,
  pageSize: number,
) {
  const { preferences } = usePreferences();
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const departmentId = searchParams.get("departmentId") ?? "";
  const severity = searchParams.get("severity") ?? "";
  const complaintTypeId = searchParams.get("complaintTypeId") ?? "";
  const examinationStatusId = searchParams.get("examinationStatusId") ?? "";
  const receptionMethodId = searchParams.get("receptionMethodId") ?? "";
  const complaintNumber = searchParams.get("complaintNumber") ?? "";
  const statementYear = searchParams.get("statementYear") ?? "";
  const sortBy = searchParams.get("sortBy") ?? preferences.complaints.sortBy;
  const sortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc" | null) ??
    preferences.complaints.sortOrder;

  return useComplaints({
    name: search || undefined,
    page,
    limit: pageSize,
    departmentId: departmentId || undefined,
    severity: (severity as "Low" | "Medium" | "High") || undefined,
    complaintTypeId: complaintTypeId ? Number(complaintTypeId) : undefined,
    examinationStatusId: examinationStatusId ? Number(examinationStatusId) : undefined,
    receptionMethodId: receptionMethodId ? Number(receptionMethodId) : undefined,
    complaintNumber: complaintNumber ? Number(complaintNumber) : undefined,
    statementYear: statementYear ? Number(statementYear) : undefined,
    sortBy: sortBy ?? undefined,
    sortOrder: sortOrder ?? undefined,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: QUERY_KEYS.departments,
    queryFn: complaintsApi.getDepartments,
  });
}

export function useComplaintTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.complaintTypes,
    queryFn: complaintsApi.getComplaintTypes,
  });
}

export function useExaminationStatuses() {
  return useQuery({
    queryKey: QUERY_KEYS.examinationStatuses,
    queryFn: complaintsApi.getExaminationStatuses,
  });
}

export function useReceptionMethods() {
  return useQuery({
    queryKey: QUERY_KEYS.receptionMethods,
    queryFn: complaintsApi.getReceptionMethods,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: QUERY_KEYS.locations,
    queryFn: complaintsApi.getLocations,
  });
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => complaintsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints });
    },
  });
}

export function useSummarizeComplaint(complaintId: string) {
  return useMutation({
    mutationFn: () => complaintsApi.summarize(complaintId),
  });
}
