import { axiosClient } from "@/api/axios-client";
import type {
  CreateLetterTemplatePayload,
  GenerateLetterResult,
  GeneratedLetter,
  LetterTemplate,
  UpdateLetterTemplatePayload,
} from "@/features/letter-templates/types";

export interface LetterTemplatesListParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  activeOnly?: boolean;
}

export const letterTemplatesApi = {
  list: (params?: LetterTemplatesListParams) =>
    axiosClient
      .get<LetterTemplate[]>("/api/letter-templates", { params })
      .then((res) => res.data),
  getById: (id: string) =>
    axiosClient
      .get<LetterTemplate>(`/api/letter-templates/${id}`)
      .then((res) => res.data),
  create: (payload: CreateLetterTemplatePayload) =>
    axiosClient
      .post<LetterTemplate>("/api/letter-templates", payload)
      .then((res) => res.data),
  update: (id: string, payload: UpdateLetterTemplatePayload) =>
    axiosClient
      .patch<LetterTemplate>(`/api/letter-templates/${id}`, payload)
      .then((res) => res.data),
  remove: (id: string) =>
    axiosClient.delete(`/api/letter-templates/${id}`).then((res) => res.data),
  importDocx: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post<{ html: string }>(
      "/api/letter-templates/import-docx",
      formData,
    );
    return res.data;
  },
  preview: async (id: string) => {
    const res = await axiosClient.post(
      `/api/letter-templates/${id}/preview`,
      null,
      { responseType: "blob" },
    );
    if (res.data && res.data.size > 0) {
      return URL.createObjectURL(res.data);
    }
    return null;
  },
  generate: (complaintId: string, templateId: string) =>
    axiosClient
      .post<GenerateLetterResult>(`/api/complaints/${complaintId}/letters`, {
        templateId,
      })
      .then((res) => res.data),
  listGenerated: (complaintId: string) =>
    axiosClient
      .get<GeneratedLetter[]>(`/api/complaints/${complaintId}/letters`)
      .then((res) => res.data),
};