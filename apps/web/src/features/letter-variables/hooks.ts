import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { letterVariablesApi } from "@/features/letter-variables/api";
import type {
  CreateLetterVariablePayload,
  UpdateLetterVariablePayload,
} from "@/features/letter-variables/types";

export const LETTER_VARIABLE_QUERY_KEYS = {
  list: ["letter-variables"] as const,
};

export function useLetterVariables(activeOnly = false) {
  return useQuery({
    queryKey: [...LETTER_VARIABLE_QUERY_KEYS.list, "flat", activeOnly],
    queryFn: () => letterVariablesApi.list(activeOnly),
  });
}

export function useLetterVariablesActive() {
  return useQuery({
    queryKey: [...LETTER_VARIABLE_QUERY_KEYS.list, "active"],
    queryFn: () => letterVariablesApi.list(true),
  });
}

export function useUploadLetterVariableImage() {
  return useMutation({
    mutationFn: (file: File) => letterVariablesApi.uploadImage(file),
    onError: () => toast.error("تعذر رفع الصورة"),
  });
}

export function useCreateLetterVariable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLetterVariablePayload) =>
      letterVariablesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_VARIABLE_QUERY_KEYS.list });
      toast.success("تم إضافة المتغير بنجاح");
    },
    onError: (e) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(msg || "تعذر إضافة المتغير");
    },
  });
}

export function useUpdateLetterVariable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateLetterVariablePayload;
    }) => letterVariablesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_VARIABLE_QUERY_KEYS.list });
      toast.success("تم تحديث المتغير بنجاح");
    },
    onError: (e) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(msg || "تعذر تحديث المتغير");
    },
  });
}

export function useDeleteLetterVariable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => letterVariablesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_VARIABLE_QUERY_KEYS.list });
      toast.success("تم حذف المتغير بنجاح");
    },
    onError: (e) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(msg || "تعذر حذف المتغير");
    },
  });
}