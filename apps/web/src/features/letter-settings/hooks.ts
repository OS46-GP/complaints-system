import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { letterSettingsApi } from "@/features/letter-settings/api";
import type { LetterSettingImageField } from "@/features/letter-settings/types";

export const LETTER_SETTINGS_QUERY_KEY = ["letter-settings"] as const;

export function useLetterSettings() {
  return useQuery({
    queryKey: LETTER_SETTINGS_QUERY_KEY,
    queryFn: () => letterSettingsApi.get(),
  });
}

export function useUpdateLetterSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof letterSettingsApi.update>[0]) =>
      letterSettingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_SETTINGS_QUERY_KEY });
      toast.success("تم حفظ بيانات الجهة بنجاح");
    },
    onError: () => toast.error("تعذر حفظ البيانات. حاول مرة أخرى."),
  });
}

export function useUploadLetterImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ field, file }: { field: LetterSettingImageField; file: File }) =>
      letterSettingsApi.uploadImage(field, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_SETTINGS_QUERY_KEY });
      toast.success("تم رفع الصورة بنجاح");
    },
    onError: () => toast.error("تعذر رفع الصورة. تأكد من امتداد وحجم الملف."),
  });
}

export function useRemoveLetterImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (field: LetterSettingImageField) =>
      letterSettingsApi.removeImage(field),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_SETTINGS_QUERY_KEY });
      toast.success("تم حذف الصورة بنجاح");
    },
    onError: () => toast.error("تعذر حذف الصورة. حاول مرة أخرى."),
  });
}