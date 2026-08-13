import { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [fillingVariables, setFillingVariables] = useState(false);
  const [variableValues, setVariableValues] = useState<
    Record<string, string>
  >({});
  const selectedId =
    selected ?? generated?.[0]?.templateId ?? templates?.[0]?.id ?? null;
  const selectedTemplate =
    templates?.find((t) => t.id === (selected ?? selectedId)) ??
    null;
  const activeVariables = selectedTemplate?.variables?.length
    ? selectedTemplate.variables
    : [];

  const [preview, setPreview] = useState<{
    url: string;
    title?: string;
  } | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelected(null);
      setFillingVariables(false);
      setVariableValues({});
      setPreview(null);
    }
    onOpenChange(next);
  };

  const openPreview = (url: string, title?: string) => {
    setPreview({ url, title });
  };

  const generateAndPreview = (
    templateId: string,
    values?: Record<string, string>,
  ) => {
    if (generateMutation.isPending) return;
    generateMutation.mutate(
      { templateId, variableValues: values },
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

  const handleConfirmValues = () => {
    if (!selectedTemplate) return;
    if (selectedTemplate.variables?.some((v) => v.required && !(variableValues[v.key]?.trim()))) {
      return;
    }
    setFillingVariables(false);
    generateAndPreview(selectedTemplate.id, variableValues);
  };

  const selectTemplate = (template: LetterTemplate) => {
    setSelected(template.id);
    setFillingVariables(false);
    setVariableValues({});
    if (template.variables?.length) {
      setFillingVariables(true);
      return;
    }
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
    if (defaultTemplate.variables?.length) {
      setFillingVariables(true);
      setVariableValues({});
      return;
    }
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
        ) : fillingVariables && selectedTemplate ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="font-bold text-foreground">
                {selectedTemplate.name}
              </div>
              <p className="text-label-sm text-muted-foreground">
                أعد تعبئة المتغيرات الخاصة بهذا النموذج قبل الإصدار:
              </p>
            </div>
            <div className="space-y-3">
              {activeVariables.map((v) => {
                const value = variableValues[v.key] ?? "";
                const missing = v.required && !value.trim();
                return (
                  <div key={v.key} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-label-sm">
                        {v.label}
                      </Label>
                      {v.required && (
                        <span className="text-label-xs rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">
                          مطلوب
                        </span>
                      )}
                      <code
                        dir="ltr"
                        className="ms-auto font-mono text-label-xs text-muted-foreground"
                      >
                        {`{{${v.key}}}`}
                      </code>
                    </div>
                    {v.type === "textarea" ? (
                      <Textarea
                        rows={3}
                        placeholder={v.placeholder || "أدخل القيمة..."}
                        value={value}
                        onChange={(e) =>
                          setVariableValues((prev) => ({
                            ...prev,
                            [v.key]: e.target.value,
                          }))
                        }
                      />
                    ) : v.type === "date" ? (
                      <Input
                        type="date"
                        value={value}
                        onChange={(e) =>
                          setVariableValues((prev) => ({
                            ...prev,
                            [v.key]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <Input
                        placeholder={v.placeholder || "أدخل القيمة..."}
                        value={value}
                        onChange={(e) =>
                          setVariableValues((prev) => ({
                            ...prev,
                            [v.key]: e.target.value,
                          }))
                        }
                      />
                    )}
                    {missing && (
                      <p className="text-label-xs text-destructive">
                        هذه القيمة مطلوبة.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFillingVariables(false)}
              >
                رجوع
              </Button>
              <Button
                type="button"
                onClick={handleConfirmValues}
                disabled={
                  generateMutation.isPending ||
                  selectedTemplate.variables?.some(
                    (v) => v.required && !variableValues[v.key]?.trim(),
                  )
                }
              >
                {generateMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                تأكيد وإصدار
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : templates?.length ? (
              <div className="max-h-72 overflow-y-auto space-y-2">
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
                      <p className="mt-1 text-label-xs text-primary">
                        يتطلب تعبئة {template.variables.length} متغير قبل الإصدار
                      </p>
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