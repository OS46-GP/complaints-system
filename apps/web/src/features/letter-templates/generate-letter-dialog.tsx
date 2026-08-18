import { useEffect, useState } from "react";
import { Loader2, Lock, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LetterTemplateTypeBadge } from "@/features/letter-templates/letter-template-type-badge";
import { LetterPreviewDialog } from "@/features/letter-templates/letter-preview-dialog";
import {
  useActiveLetterTemplates,
  useComplaintLetters,
  useGenerateLetter,
} from "@/features/letter-templates/hooks";
import type { LetterTemplate } from "@/features/letter-templates/types";
import { resolveDownloadUrl } from "@/features/reporting/api";
import { cn } from "@/lib/utils";

interface GenerateLetterDialogProps {
  complaintId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direct?: boolean;
}

export function GenerateLetterDialog({
  complaintId,
  open,
  onOpenChange,
  direct = false,
}: GenerateLetterDialogProps) {
  const { data: templates, isLoading } = useActiveLetterTemplates();
  const { data: generated } = useComplaintLetters(complaintId);
  const generateMutation = useGenerateLetter(complaintId);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedId =
    selected ?? generated?.[0]?.templateId ?? templates?.[0]?.id ?? null;

  const [preview, setPreview] = useState<{
    url: string;
    title?: string;
  } | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelected(null);
      setPreview(null);
    }
    onOpenChange(next);
  };

  const openPreview = (url: string, title?: string) => {
    setPreview({ url, title });
  };

  const generateAndPreview = (templateId: string) => {
    if (generateMutation.isPending) return;
    generateMutation.mutate(
      { templateId },
      {
        onSuccess: (result) => {
          openPreview(
            resolveDownloadUrl(result.downloadUrl),
            `معاينة: ${result.templateName}`,
          );
        },
      },
    );
  };

  const selectTemplate = (template: LetterTemplate) => {
    setSelected(template.id);
    generateAndPreview(template.id);
  };

  useEffect(() => {
    if (!open || !direct || generateMutation.isPending || preview) return;
    const defaultTemplate =
      templates?.find((t) => t.isDefault) ??
      templates?.find((t) => t.id === selectedId) ??
      templates?.[0];
    if (!defaultTemplate) return;
    setSelected(defaultTemplate.id);
    generateAndPreview(defaultTemplate.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, direct, selectedId, preview, generateMutation, templates]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إصدار خطاب للشكوى</DialogTitle>
          {!direct && (
            <DialogDescription>
              اختر نموذج الخطاب المناسب ليتم إنشاؤه ومعاينته مباشرة ببيانات
              الشكوى وبيانات الجهة.
            </DialogDescription>
          )}
        </DialogHeader>

        {generateMutation.isPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-label-sm">
              {direct
                ? "جارٍ إصدار الخطاب بالنموذج الافتراضي وفتح المعاينة..."
                : "جارٍ إصدار الخطاب وفتح المعاينة..."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : templates?.length ? (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template)}
                    className={cn(
                      "w-full text-start rounded-xl border p-3 transition-colors",
                      selectedId === template.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">
                        {template.name}
                      </span>
                      <LetterTemplateTypeBadge type={template.type} />
                    </div>
                    {template.description && (
                      <p className="text-label-sm text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    {!!template.variables?.length && (
                      <div className="mt-2 space-y-1 border-t border-border/70 pt-2">
                        <p className="flex items-center gap-1 text-label-xs text-muted-foreground">
                          <Lock className="size-3" />
                          قيم ثابتة محددة من الإدارة (للاطلاع فقط):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {template.variables.map((v) => (
                            <span
                              key={v.key}
                              className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-label-xs"
                            >
                              <span className="font-medium text-foreground">
                                {v.label ?? v.key}
                              </span>
                              <span className="text-muted-foreground">:</span>
                              <span className="text-primary">
                                {v.defaultValue?.trim() || "—"}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-label-sm text-muted-foreground">
                لا توجد نماذج خطابات مفعّلة حالياً.
              </p>
            )}

            {!!generated?.length && (
              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-label-sm font-bold text-foreground">
                  خطابات صادرة سابقاً
                </p>
                {generated.map((letter) => (
                  <button
                    key={letter.id}
                    type="button"
                    onClick={() =>
                      openPreview(
                        resolveDownloadUrl(letter.downloadUrl),
                        `معاينة: ${letter.templateName}`,
                      )
                    }
                    className="flex items-center gap-2 text-label-sm text-primary hover:underline"
                  >
                    <Printer className="size-4" />
                    {letter.templateName}{" "}
                    {new Date(letter.generatedAt).toLocaleDateString("ar-EG")}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generateMutation.isPending}
          >
            إلغاء
          </Button>
        </DialogFooter>

        <LetterPreviewDialog
          open={!!preview}
          onOpenChange={(next) => {
            if (!next) {
              setPreview(null);
              if (direct) onOpenChange(false);
            }
          }}
          url={preview?.url ?? null}
          title={preview?.title}
        />
      </DialogContent>
    </Dialog>
  );
}
