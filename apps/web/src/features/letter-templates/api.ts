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
  uploadAsset: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post<{
      id: string;
      assetKey: string;
      downloadUrl: string;
    }>(`/api/letter-templates/${id}/asset`, formData);
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
  previewDraft: async (payload: {
    type: "HTML" | "DOCX";
    body?: string;
    file?: File;
  }) => {
    const formData = new FormData();
    formData.append("type", payload.type);
    if (payload.body !== undefined) formData.append("body", payload.body);
    if (payload.file) formData.append("file", payload.file);
    const res = await axiosClient.post(
      "/api/letter-templates/preview-draft",
      formData,
      { responseType: "blob" },
    );
    if (res.data && res.data.size > 0) {
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener,noreferrer");
    }
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