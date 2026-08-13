import { axiosClient } from "@/api/axios-client";
import type {
  CreateLetterTemplatePayload,
  GenerateLetterResult,
  GeneratedLetter,
  LetterTemplate,
  PlaceholderGroup,
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
  placeholders: () =>
    axiosClient
      .get<PlaceholderGroup[]>("/api/letter-templates/placeholders")
      .then((res) => res.data),
  preview: async (id: string) => {
    const res = await axiosClient.post(
      `/api/letter-templates/${id}/preview`,
      null,
      { responseType: "blob" },
    );
    if (res.data && res.data.size > 0) {
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  },
  generate: (complaintId: string, templateId: string, variableValues?: Record<string, string>) =>
    axiosClient
      .post<GenerateLetterResult>(`/api/complaints/${complaintId}/letters`, {
        templateId,
        ...(variableValues && Object.keys(variableValues).length
          ? { variableValues }
          : {}),
      })
      .then((res) => res.data),
  listGenerated: (complaintId: string) =>
    axiosClient
      .get<GeneratedLetter[]>(`/api/complaints/${complaintId}/letters`)
      .then((res) => res.data),
};