import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  FileUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  WysiwygEditor,
  type WysiwygEditorHandle,
} from "@/components/shared/wysiwyg-editor";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { PATHS } from "@/router/paths";
import {
  useCreateLetterTemplate,
  useImportLetterTemplateDocx,
  useLetterPlaceholders,
  useUpdateLetterTemplate,
} from "@/features/letter-templates/hooks";
import type { LetterTemplate } from "@/features/letter-templates/types";
import type { TemplateVariable } from "@/features/letter-templates/types";
import { renderLetterPreview } from "@/features/letter-templates/live-preview";

interface LetterTemplateFormProps {
  template?: LetterTemplate | null;
}

const schema = z.object({
  name: z.string().min(1, "اسم النموذج مطلوب").max(200),
  description: z.string().max(2000).optional(),
  body: z.string().optional(),
  variables: z
    .array(
      z.object({
        key: z
          .string()
          .min(1, "المفتاح مطلوب")
          .max(64, "المفتاح يجب ألا يتجاوز 64 حرفاً")
          .regex(
            /^[a-zA-Z][a-zA-Z0-9_.]*$/,
            "المفتاح يجب أن يبدأ بحرف إنجليزي وأن يحتوي أرقاماً ونقاطاً وأسفل سطر فقط",
          ),
        placeholder: z.string().optional(),
        type: z.enum(["text", "textarea", "date"]).optional(),
        group: z.string().optional(),
        defaultValue: z
          .string()
          .min(1, "القيمة مطلوبة لأن المتغير إلزامي")
          .max(500, "القيمة يجب ألا تتجاوز 500 حرف"),
      }),
    ),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number().int().min(0),
});

const EMPTY_DRAFT: TemplateVariable = {
  key: "",
  type: "text",
  defaultValue: "",
};

interface DraftErrors {
  key?: string;
  defaultValue?: string;
}

type FormValues = z.infer<typeof schema>;

export function LetterTemplateForm({ template }: LetterTemplateFormProps) {
  const isEdit = !!template;
  const navigate = useNavigate();
  const docxInputRef = useRef<HTMLInputElement>(null);
  const wysiwygRef = useRef<WysiwygEditorHandle>(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [draftVariable, setDraftVariable] = useState<TemplateVariable>(EMPTY_DRAFT);
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const createMutation = useCreateLetterTemplate();
  const updateMutation = useUpdateLetterTemplate();
  const importMutation = useImportLetterTemplateDocx();
  const { data: placeholderGroups } = useLetterPlaceholders();
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    importMutation.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: template?.name ?? "",
      description: template?.description ?? "",
      body: template?.body ?? "",
      variables: template?.variables ?? [],
      isActive: template?.isActive ?? true,
      isDefault: template?.isDefault ?? false,
      sortOrder: template?.sortOrder ?? 0,
    },
  });

  useEffect(() => {
    reset({
      name: template?.name ?? "",
      description: template?.description ?? "",
      body: template?.body ?? "",
      variables: template?.variables ?? [],
      isActive: template?.isActive ?? true,
      isDefault: template?.isDefault ?? false,
      sortOrder: template?.sortOrder ?? 0,
    });
  }, [template, reset]);

  const templateVariables = useWatch<FormValues, "variables">({
    control,
    name: "variables",
    defaultValue: [] as TemplateVariable[],
  }) as TemplateVariable[];

  const resetDraft = () => {
    setDraftVariable(EMPTY_DRAFT);
    setDraftErrors({});
    setEditingIndex(null);
    setVariableModalOpen(false);
  };

  const openAddVariable = () => {
    setDraftVariable(EMPTY_DRAFT);
    setDraftErrors({});
    setEditingIndex(null);
    setVariableModalOpen(true);
  };

  const validateDraft = (): DraftErrors => {
    const errors: DraftErrors = {};
    const key = draftVariable.key.trim();
    const value = (draftVariable.defaultValue ?? "").trim();

    if (!key) {
      errors.key = "مفتاح المتغير مطلوب";
    } else if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(key)) {
      errors.key =
        "يجب أن يبدأ بحرف إنجليزي ويحتوي أرقاماً ونقاطاً وأسفل سطر فقط";
    } else if (key.length > 64) {
      errors.key = "المفتاح يجب ألا يتجاوز 64 حرفاً";
    } else if (
      editingIndex === null &&
      templateVariables.some((v) => v.key === key)
    ) {
      errors.key = "هذا المفتاح مستخدم بالفعل في النموذج";
    }

    if (!value) {
      errors.defaultValue = "القيمة مطلوبة لأن المتغير إلزامي";
    } else if (value.length > 500) {
      errors.defaultValue = "القيمة يجب ألا تتجاوز 500 حرف";
    }

    return errors;
  };

  const handleDraftChange = (
    field: keyof DraftErrors,
    updater: (d: TemplateVariable) => TemplateVariable,
  ) => {
    setDraftVariable(updater);
    setDraftErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const startEdit = (idx: number) => {
    setEditingIndex(idx);
    setDraftErrors({});
    setDraftVariable({ ...templateVariables[idx] });
    setVariableModalOpen(true);
  };

  const insertPlaceholder = (key: string) => {
    if (wysiwygRef.current) {
      wysiwygRef.current.insertHtml(` {{${key}}} `);
      return;
    }
    const value = getValues("body") ?? "";
    setValue("body", `${value} {{${key}}}`, { shouldDirty: true });
  };

  const bodyValue = useWatch<FormValues, "body">({
    control,
    name: "body",
    defaultValue: "",
  }) ?? "";

  const isActive = useWatch<FormValues, "isActive">({
    control,
    name: "isActive",
    defaultValue: template?.isActive ?? true,
  });

  const isDefault = useWatch<FormValues, "isDefault">({
    control,
    name: "isDefault",
    defaultValue: template?.isDefault ?? false,
  });
  const livePreviewHtml = useMemo(
    () => renderLetterPreview(bodyValue, templateVariables),
    [bodyValue, templateVariables],
  );

  const handleImportFile = (file?: File) => {
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: (result) => {
        setValue("body", result.html, { shouldDirty: true });
      },
    });
  };

  const goBack = () => navigate(PATHS.ADMIN.LETTER_TEMPLATES);

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: template!.id, payload: values },
        { onSuccess: goBack },
      );
      return;
    }
    createMutation.mutate(values, { onSuccess: goBack });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEdit ? "تعديل نموذج الخطاب" : "إنشاء نموذج خطاب جديد"}
        description="اكتب محتوى الخطاب مع إدراج المتغيرات الديناميكية من القائمة {{variable}}، وتُستبدل تلقائياً ببيانات الشكوى وبيانات الجهة عند الإصدار."
      >
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={goBack}
        >
          <ArrowRight className="size-4" />
          رجوع للقائمة
        </Button>
      </PageHeader>

      <Card className="p-5 md:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-3">
            <div className="border-b border-border pb-2">
              <h2 className="text-label-md font-bold text-foreground">
                المعلومات الأساسية
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lt-name">اسم النموذج</Label>
                <Input
                  id="lt-name"
                  dir="rtl"
                  placeholder="مثال: خطاب طلب الاطلاع على الشكوى"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-destructive text-label-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lt-desc">وصف مختصر</Label>
                <Input
                  id="lt-desc"
                  dir="rtl"
                  placeholder="وصف يوضح الغرض من النموذج ووقت استخدامه"
                  {...register("description")}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
              <h2 className="text-label-md font-bold text-foreground">
                محتوى الخطاب
              </h2>
              <input
                ref={docxInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  handleImportFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => docxInputRef.current?.click()}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileUp className="size-4" />
                )}
                {importMutation.isPending
                  ? "جارٍ التحويل..."
                  : "استيراد من ملف Word"}
              </Button>
            </div>

            <WysiwygEditor
              ref={wysiwygRef}
              value={bodyValue}
              height={600}
              className="letter-wysiwyg rounded-md"
              onChange={(v) =>
                setValue("body", v, {
                  shouldDirty: true,
                  shouldValidate: false,
                })
              }
            />

            <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setPreviewOpen((o) => !o)}
                className={cn(
                  "flex items-center justify-between w-full bg-surface-container-lowest px-3 py-2 text-label-sm font-bold text-muted-foreground hover:bg-accent transition-colors",
                  previewOpen && "border-b border-border",
                )}
              >
                <span className="flex items-center gap-2">
                  <Eye className="size-4" />
                  معاينة مباشرة
                  {!previewOpen && (
                    <span className="rounded-full bg-primary/10 text-primary text-label-xs px-2 py-0.5">
                      تُستبدل البيانات التجريبية ببيانات الشكوى عند الإصدار
                    </span>
                  )}
                </span>
                {previewOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
              {previewOpen && (
                <iframe
                  title="معاينة مباشرة لنموذج الخطاب"
                  sandbox=""
                  srcDoc={livePreviewHtml}
                  className="w-full min-h-[600px] bg-white"
                />
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="border-b border-border pb-2">
              <h2 className="text-label-md font-bold text-foreground">
                المتغيرات
              </h2>
            </div>

            <div className="rounded-xl border border-border bg-surface-container-lowest p-3 space-y-2">
              <p className="text-label-sm font-bold text-muted-foreground">
                المتغيرات العامة المتاحة (اضغط للإدراج)
              </p>
              {placeholderGroups?.length ? (
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {placeholderGroups.map((group) => (
                    <div
                      key={group.group}
                      className="flex flex-wrap gap-1.5 items-baseline"
                    >
                      <span className="text-label-sm font-bold text-muted-foreground ml-1">
                        {group.label}:
                      </span>
                      {group.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => insertPlaceholder(item.key)}
                          className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-mono-data text-label-sm text-primary hover:bg-accent transition-colors"
                          title={item.label}
                        >
                          {`{{${item.key}}}`}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-label-sm text-muted-foreground">
                  لا توجد متغيرات عامة متاحة.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface-container-lowest p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-label-sm font-bold text-muted-foreground">
                    متغيرات داخلية بقيم ثابتة
                  </p>
                  {templateVariables.length > 0 && (
                    <span className="rounded-full bg-primary/10 text-primary text-label-xs px-2 py-0.5">
                      {templateVariables.length}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={openAddVariable}
                >
                  <Plus className="size-4" />
                  إضافة متغير
                </Button>
              </div>

              {templateVariables.length === 0 ? (
                <p className="text-label-sm text-muted-foreground">
                  لا توجد متغيرات داخلية بعد. أضف متغيراً بقيمة ثابتة يحددها
                  المشرف (مثل رقم القرار، اسم المأمورية، الرقم القانوني...) —
                  تُستخدم قيمتها عند الإصدار ولا يمكن تغييرها من طرف المستخدم.
                </p>
              ) : (
                <div className="space-y-2">
                  {templateVariables.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-label-sm text-primary"
                          dir="ltr"
                        >
                          {"{{"}{v.key}{"}}"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-label-xs text-muted-foreground">
                          القيمة:
                        </span>
                        <span className="rounded-full bg-primary/10 text-primary text-label-xs px-2 py-0.5 font-medium">
                          {v.defaultValue?.trim() || ""}
                        </span>
                      </div>
                      <div className="ms-auto flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => startEdit(idx)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() => setDeleteIndex(idx)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1.5 items-baseline">
                    <span className="text-label-sm font-bold text-muted-foreground">
                      إدراج في المحتوى:
                    </span>
                    {templateVariables.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => insertPlaceholder(v.key)}
                        className="rounded-full border border-pink-300 bg-pink-50 px-2.5 py-0.5 font-mono text-mono-data text-label-sm text-pink-700 hover:bg-pink-100 transition-colors"
                        title={v.key}
                      >
                        {`{{${v.key}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Dialog
                open={variableModalOpen}
                onOpenChange={(open) => {
                  if (!open) resetDraft();
                }}
              >
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingIndex !== null
                        ? "تعديل المتغير الداخلي"
                        : "إضافة متغير داخلي"}
                    </DialogTitle>
                    <DialogDescription>
                      مقرين بقيمة ثابتة يحددها المشرف — تُستخدم عند إصدار
                      الخطاب ولا يمكن تغييرها من طرف المستخدم.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="var-key" className="text-label-sm font-bold">
                        المفتاح ({"{{"} key {"}}"})
                      </Label>
                      <Input
                        id="var-key"
                        dir="ltr"
                        className="w-full font-mono text-label-sm"
                        placeholder="variableName"
                        value={draftVariable.key}
                        aria-invalid={!!draftErrors.key}
                        disabled={editingIndex !== null}
                        onChange={(e) =>
                          handleDraftChange("key", (d) => ({
                            ...d,
                            key: e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""),
                          }))
                        }
                      />
                      {draftErrors.key && (
                        <p className="text-label-xs text-destructive">
                          {draftErrors.key}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="var-value"
                        className="text-label-sm font-bold"
                      >
                        القيمة الثابتة
                      </Label>
                      <Input
                        id="var-value"
                        className="w-full text-label-sm"
                        placeholder="القيمة الثابتة (تظهر للمستخدم للاطلاع فقط)"
                        value={draftVariable.defaultValue ?? ""}
                        aria-invalid={!!draftErrors.defaultValue}
                        onChange={(e) =>
                          handleDraftChange("defaultValue", (d) => ({
                            ...d,
                            defaultValue: e.target.value,
                          }))
                        }
                      />
                      {draftErrors.defaultValue && (
                        <p className="text-label-xs text-destructive">
                          {draftErrors.defaultValue}
                        </p>
                      )}
                    </div>

                    <p className="text-label-xs text-muted-foreground">
                      المفتاح يبدأ بحرف إنجليزي ويمكن أن يحتوي أرقاماً ونقاطاً
                      وأسفل سطر فقط — يُستخدم داخل {"{{}}"} في المحتوى، وتُدمج
                      القيمة الثابتة تلقائياً عند إصدار الخطاب.
                    </p>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetDraft}
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="button"
                      className="gap-2"
                      onClick={() => {
                        const errors = validateDraft();
                        setDraftErrors(errors);
                        if (Object.keys(errors).length) return;
                        if (editingIndex === null) {
                          setValue(
                            "variables",
                            [
                              ...templateVariables,
                              {
                                ...draftVariable,
                                key: draftVariable.key.trim(),
                              },
                            ],
                            { shouldDirty: true },
                          );
                        } else {
                          const next = templateVariables.map((v, i) =>
                            i === editingIndex
                              ? { ...draftVariable, key: v.key }
                              : v,
                          );
                          setValue("variables", next, { shouldDirty: true });
                        }
                        resetDraft();
                      }}
                    >
                      {editingIndex !== null ? (
                        <Pencil className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      {editingIndex !== null ? "حفظ التعديل" : "إضافة"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          <section className="space-y-3">
            <div className="border-b border-border pb-2">
              <h2 className="text-label-md font-bold text-foreground">
                إعدادات العرض
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-border bg-surface-container-lowest p-3">
              <label className="flex items-center gap-2 text-label-sm">
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
                مفعّل
              </label>
              <label className="flex items-center gap-2 text-label-sm">
                <Switch
                  checked={isDefault}
                  onCheckedChange={(v) => setValue("isDefault", v)}
                />
                النموذج الافتراضي
              </label>
              <label className="flex items-center gap-2 text-label-sm">
                <span className="text-muted-foreground">ترتيب العرض:</span>
                <Input
                  type="number"
                  className="w-24"
                  min={0}
                  {...register("sortOrder", { valueAsNumber: true })}
                />
              </label>
            </div>
          </section>

          <div className="flex items-center justify-start gap-2 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending
                ? "جارٍ الحفظ..."
                : isEdit
                  ? "حفظ التغييرات"
                  : "إنشاء النموذج"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={isPending}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteIndex(null);
        }}
        title="حذف المتغير الداخلي"
        description={
          deleteIndex !== null
            ? `هل أنت متأكد من حذف المتغير "{{${templateVariables[deleteIndex]?.key ?? ""}}}"؟ سيُحذف من النموذج ولن تُستبدل قيمته في الخطابات القادمة.`
            : ""
        }
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="destructive"
        onConfirm={() => {
          if (deleteIndex !== null) {
            const next = templateVariables.filter(
              (_, i) => i !== deleteIndex,
            );
            setValue("variables", next, { shouldDirty: true });
            setDeleteIndex(null);
          }
        }}
      />
    </div>
  );
}