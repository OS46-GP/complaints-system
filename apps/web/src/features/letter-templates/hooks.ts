import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { letterTemplatesApi } from "@/features/letter-templates/api";
import { resolveDownloadUrl } from "@/features/reporting/api";

export const LETTER_QUERY_KEYS = {
  templates: ["letter-templates"] as const,
  placeholders: ["letter-templates-placeholders"] as const,
  generated: (complaintId: string) => ["letter-generations", complaintId] as const,
};

export function useLetterTemplates(params?: {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  activeOnly?: boolean;
}) {
  return useQuery({
    queryKey: [...LETTER_QUERY_KEYS.templates, params],
    queryFn: () => letterTemplatesApi.list(params),
  });
}

export function useLetterTemplate(id?: string) {
  return useQuery({
    queryKey: [...LETTER_QUERY_KEYS.templates, "detail", id],
    queryFn: () => letterTemplatesApi.getById(id!),
    enabled: !!id,
  });
}

export function useActiveLetterTemplates() {
  return useLetterTemplates({ activeOnly: true, sortBy: "sortOrder" });
}

export function useLetterPlaceholders() {
  return useQuery({
    queryKey: LETTER_QUERY_KEYS.placeholders,
    queryFn: () => letterTemplatesApi.placeholders(),
  });
}

export function useCreateLetterTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof letterTemplatesApi.create>[0]) =>
      letterTemplatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_QUERY_KEYS.templates });
      toast.success("تم إنشاء نموذج الخطاب بنجاح");
    },
  });
}

export function useUpdateLetterTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof letterTemplatesApi.update>[1];
    }) => letterTemplatesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_QUERY_KEYS.templates });
      toast.success("تم تحديث نموذج الخطاب بنجاح");
    },
  });
}

export function useDeleteLetterTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => letterTemplatesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LETTER_QUERY_KEYS.templates });
      toast.success("تم حذف نموذج الخطاب بنجاح");
    },
  });
}

export function useImportLetterTemplateDocx() {
  return useMutation({
    mutationFn: (file: File) => letterTemplatesApi.importDocx(file),
    onError: () => toast.error("تعذر استيراد ملف Word. تأكد أنه ملف DOCX صالح."),
  });
}

export function usePreviewLetterTemplate() {
  return useMutation({
    mutationFn: (id: string) => letterTemplatesApi.preview(id),
    onError: () => toast.error("تعذر معاينة النموذج."),
  });
}

export function useGenerateLetter(complaintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { templateId: string }) =>
      letterTemplatesApi.generate(complaintId, args.templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LETTER_QUERY_KEYS.generated(complaintId),
      });
      toast.success("تم إصدار الخطاب بنجاح");
    },
    onError: (e) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      toast.error(msg || "تعذر إصدار الخطاب. حاول مرة أخرى.");
    },
  });
}

export function useComplaintLetters(complaintId: string) {
  return useQuery({
    queryKey: LETTER_QUERY_KEYS.generated(complaintId),
    queryFn: () => letterTemplatesApi.listGenerated(complaintId),
    enabled: !!complaintId,
  });
}

export function useDownloadUrl(downloadUrl: string | undefined | null) {
  return downloadUrl ? resolveDownloadUrl(downloadUrl) : null;
}