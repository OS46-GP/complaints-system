import { axiosClient } from "@/api/axios-client";
import type { ApiComplaint, PaginatedComplaintResponse } from "@/features/complaint-list/types";

export interface ListComplaintsParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  name?: string;
  complaintNumber?: number;
  statementYear?: number;
}

export const complaintsApi = {
  list: (params?: ListComplaintsParams) =>
    axiosClient
      .get<PaginatedComplaintResponse>("/api/complaints", { params })
      .then((res) => res.data),
  getById: (id: string) =>
    axiosClient.get<ApiComplaint>(`/api/complaints/${id}`).then((res) => res.data),
  remove: (id: string) =>
    axiosClient.delete(`/api/complaints/${id}`).then((res) => res.data),
};
