import { axiosClient } from "@/api/axios-client";
import type {
  CreateLetterVariablePayload,
  LetterVariable,
  UpdateLetterVariablePayload,
} from "@/features/letter-variables/types";

export interface LetterVariableUploadResult {
  storageKey: string;
  downloadUrl: string;
}

export const letterVariablesApi = {
  list: (activeOnly = true) =>
    axiosClient
      .get<LetterVariable[]>("/api/letter-variables", {
        params: activeOnly ? undefined : { activeOnly: "false" },
      })
      .then((res) => res.data),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient
      .post<LetterVariableUploadResult>("/api/letter-variables/images", form)
      .then((res) => res.data);
  },
  create: (payload: CreateLetterVariablePayload) =>
    axiosClient
      .post<LetterVariable>("/api/letter-variables", payload)
      .then((res) => res.data),
  update: (id: string, payload: UpdateLetterVariablePayload) =>
    axiosClient
      .patch<LetterVariable>(`/api/letter-variables/${id}`, payload)
      .then((res) => res.data),
  remove: (id: string) =>
    axiosClient.delete(`/api/letter-variables/${id}`).then((res) => res.data),
};