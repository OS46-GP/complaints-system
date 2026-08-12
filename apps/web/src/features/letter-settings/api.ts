import { axiosClient } from "@/api/axios-client";
import type {
  LetterSettings,
  LetterSettingImageField,
  UpdateLetterSettingsPayload,
} from "@/features/letter-settings/types";

export const letterSettingsApi = {
  get: () =>
    axiosClient.get<LetterSettings>("/api/letter-settings").then((res) => res.data),
  update: (payload: UpdateLetterSettingsPayload) =>
    axiosClient
      .patch<LetterSettings>("/api/letter-settings", payload)
      .then((res) => res.data),
  uploadImage: async (field: LetterSettingImageField, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient
      .post<LetterSettings>(`/api/letter-settings/images/${field}`, formData)
      .then((res) => res.data);
  },
};