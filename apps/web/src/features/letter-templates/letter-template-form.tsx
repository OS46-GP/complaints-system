import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WysiwygEditor,
  type WysiwygEditorHandle,
} from "@/components/shared/wysiwyg-editor";
import { ImageUploadField } from "@/components/shared/image-upload-field";
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
import type {
  TemplateVariable,
  TemplateVariableType,
} from "@/features/letter-templates/types";
import {
  renderLetterPreview,
  type PreviewVariable,
} from "@/features/letter-templates/live-preview";
import { useLetterSettings } from "@/features/letter-settings/hooks";
import { useUploadLetterVariableImage } from "@/features/letter-variables/hooks";
import {
  LETTER_VARIABLE_NOW,
  LETTER_VARIABLE_TYPE_LABELS,
} from "@/features/letter-variables/types";

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
        label: z
          .string()
          .max(200, "الاسم يجب ألا يتجاوز 200 حرف")
          .optional(),
        placeholder: z.string().optional(),
        type: z.enum(["text", "textarea", "date", "image"]).optional(),
        defaultValue: z
          .string()
          .max(2000, "القيمة يجب ألا تتجاوز 2000 حرف")
          .optional(),
        imageUrl: z
          .string()
          .max(500, "رابط الصورة يجب ألا يتجاوز 500 حرف")
          .optional()
          .nullable(),
        fallbackText: z
          .string()
          .max(500, "النص الاحتياطي يجب ألا يتجاوز 500 حرف")
          .optional()
          .nullable(),
        required: z.boolean().optional(),
      }),
    ),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number().int().min(0),
});

const EMPTY_DRAFT: TemplateVariable = {
  key: "",
  label: "",
  type: "text",
  defaultValue: "",
  imageUrl: null,
  fallbackText: "",
  required: false,
};

interface DraftErrors {
  key?: string;
  label?: string;
  defaultValue?: string;
  image?: string;
}

type FormValues = z.infer<typeof schema>;

export function LetterTemplateForm({ template }: LetterTemplateFormProps) {
  const isEdit = !!template;
  const navigate = useNavigate();
  const docxInputRef = useRef<HTMLInputElement>(null);
  const wysiwygRef = useRef<WysiwygEditorHandle>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftVariable, setDraftVariable] = useState<TemplateVariable>(EMPTY_DRAFT);
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const createMutation = useCreateLetterTemplate();
  const updateMutation = useUpdateLetterTemplate();
  const importMutation = useImportLetterTemplateDocx();
  const uploadMutation = useUploadLetterVariableImage();
  const { data: placeholders } = useLetterPlaceholders();
  const { data: letterSettings } = useLetterSettings();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
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

  const imageSourceByKey = useMemo(() => {
    const map: Record<string, string | null> = {
      organizationLetterhead: letterSettings?.organizationLetterheadUrl ?? null,
      managerSignature: letterSettings?.managerSignatureUrl ?? null,
      seal: letterSettings?.sealUrl ?? null,
    };
    for (const p of placeholders ?? []) {
      if (p.type === "image" && p.imageUrl) map[p.key] = p.imageUrl;
    }
    for (const v of templateVariables) {
      if (v.type === "image" && v.imageUrl) map[v.key] = v.imageUrl;
    }
    return map;
  }, [letterSettings, placeholders, templateVariables]);

  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = [];
    for (const [key, url] of Object.entries(imageSourceByKey)) {
      if (!url) continue;
      const img = new Image();
      img.onload = () => {
        if (mounted) setLoadedImages((prev) => ({ ...prev, [key]: true }));
      };
      img.onerror = () => {
        if (mounted) setLoadedImages((prev) => ({ ...prev, [key]: false }));
      };
      img.src = url;
      images.push(img);
    }
    return () => {
      mounted = false;
      for (const img of images) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [imageSourceByKey]);

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
    const label = (draftVariable.label ?? "").trim();

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

    if (label.length > 200) {
      errors.label = "الاسم يجب ألا يتجاوز 200 حرف";
    }

    if (draftVariable.type === "image") {
      if (
        !draftVariable.imageUrl?.trim() &&
        !draftVariable.fallbackText?.trim()
      ) {
        errors.image = "ارفع صورة أو اكتب نصاً احتياطياً";
      }
    } else if (!value) {
      errors.defaultValue = "القيمة مطلوبة لأن المتغير إلزامي";
    } else if (value.length > 2000) {
      errors.defaultValue = "القيمة يجب ألا تتجاوز 2000 حرف";
    }

    return errors;
  };

  const handleLocalTypeChange = (value: string) => {
    const next = value as TemplateVariableType;
    setDraftVariable((d) => ({
      ...d,
      type: next,
      ...(next === "image"
        ? { defaultValue: "", fallbackText: d.fallbackText }
        : { imageUrl: null, fallbackText: "" }),
    }));
  };

  const handleLocalUpload = (file: File) => {
    uploadMutation.mutate(file, {
      onSuccess: (result) =>
        setDraftVariable((d) => ({ ...d, imageUrl: result.downloadUrl })),
    });
  };

  const useNow =
    draftVariable.defaultValue?.trim() === LETTER_VARIABLE_NOW;

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

  const globalPreviewVariables = useMemo<PreviewVariable[]>(() => {
    const list: PreviewVariable[] = [];
    for (const item of placeholders ?? []) {
      if (item.type === "image") {
        const imageUrl = item.imageUrl ?? imageSourceByKey[item.key] ?? null;
        if (imageUrl) {
          list.push({
            key: item.key,
            label: item.label,
            type: item.type,
            imageUrl,
            imageLoaded: loadedImages[item.key] === true,
          });
        }
        continue;
      }
      if (item.defaultValue?.trim()) {
        list.push({
          key: item.key,
          label: item.label,
          defaultValue: item.defaultValue,
          type: item.type,
        });
      }
    }
    return list;
  }, [placeholders, imageSourceByKey, loadedImages]);

  const variableTypes = useMemo<Record<string, string>>(() => {
    const types: Record<string, string> = {};
    for (const item of placeholders ?? []) {
      types[item.key] = item.type;
    }
    for (const v of templateVariables) {
      types[v.key] = v.type ?? "text";
    }
    return types;
  }, [placeholders, templateVariables]);

  const variableLabels = useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = {};
    for (const item of placeholders ?? []) {
      labels[item.key] = item.label;
    }
    for (const v of templateVariables) {
      labels[v.key] = v.label?.trim() || v.key;
    }
    return labels;
  }, [placeholders, templateVariables]);

  const localPreviewVariables = useMemo<PreviewVariable[]>(
    () =>
      templateVariables.map((v) => ({
        key: v.key,
        label: v.label,
        defaultValue: v.defaultValue,
        type: v.type ?? "text",
        ...(v.type === "image"
          ? {
              imageUrl: v.imageUrl ?? null,
              imageLoaded: loadedImages[v.key] === true,
            }
          : {}),
      })),
    [templateVariables, loadedImages],
  );

  const livePreviewHtml = useMemo(
    () =>
      renderLetterPreview(bodyValue, [
        ...globalPreviewVariables,
        ...localPreviewVariables,
      ]),
    [bodyValue, localPreviewVariables, globalPreviewVariables],
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
              <h2 className="text-label-md font-bold text-foreground">
                المتغيرات العامة
              </h2>
              <span className="rounded-full bg-primary/10 text-primary text-label-xs px-2 py-0.5">
                اضغط للإدراج في المحتوى
              </span>
            </div>

            <div className="mt-4 max-h-[70vh] space-y-5 overflow-y-auto pe-1">
              {placeholders?.length ? (
                <div className="flex flex-col gap-1.5">
                  {placeholders.map((item) => (
                    <button
                      key={item.id ?? item.key}
                      type="button"
                      onClick={() => insertPlaceholder(item.key)}
                      title={`{{${item.key}}}`}
                      className="flex w-full items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-start transition-colors hover:bg-accent"
                    >
                      <span className="w-full truncate text-label-sm font-medium text-foreground">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-label-sm text-muted-foreground">
                  لا توجد متغيرات عامة متاحة.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
              <h2 className="text-label-md font-bold text-foreground">
                متغيرات النموذج الثابتة
              </h2>
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
              <p className="mt-4 text-label-sm text-muted-foreground">
                لا توجد متغيرات داخلية بعد. أضف متغيراً بقيمة ثابتة يحددها
                المشرف (مثل رقم القرار، اسم المأمورية، الرقم القانوني...) —
                تُستخدم قيمتها عند الإصدار ولا يمكن تغييرها من طرف المستخدم.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {templateVariables.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2"
                  >
                    <button
                      type="button"
                      title={`إدراج {{${v.key}}}`}
                      onClick={() => insertPlaceholder(v.key)}
                      className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-start"
                    >
                      <span className="w-full truncate text-label-sm font-medium text-foreground">
                        {v.label?.trim() || v.key}
                      </span>
                      <span className="rounded-full bg-surface-container-low text-label-xs text-muted-foreground px-2 py-0.5">
                        {LETTER_VARIABLE_TYPE_LABELS[v.type ?? "text"]}
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
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
              </div>
            )}
          </Card>
        </aside>

        <Card className="p-5 md:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section className="space-y-3">
              <div className="border-b border-border pb-2">
                <h2 className="text-label-md font-bold text-foreground">
                  المعلومات الأساسية
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lt-desc">وصف مختصر</Label>
                  <Textarea
                    id="lt-desc"
                    dir="rtl"
                    rows={3}
                    className="resize-y"
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
                variableLabels={variableLabels}
                variableTypes={variableTypes}
                variableImageSources={imageSourceByKey}
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
                  onClick={() => setPreviewOpen(true)}
                  className="flex items-center justify-between w-full bg-surface-container-lowest px-3 py-2 text-label-sm font-bold text-muted-foreground hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="size-4" />
                    معاينة مباشرة
                    <span className="rounded-full bg-primary/10 text-primary text-label-xs px-2 py-0.5">
                      تُستبدل البيانات التجريبية ببيانات الشكوى عند الإصدار
                    </span>
                  </span>
                  <span className="text-label-xs">عرض في نافذة منبثقة</span>
                </button>
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
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>معاينة مباشرة لنموذج الخطاب</DialogTitle>
          </DialogHeader>
          <p className="text-label-sm text-muted-foreground">
            تُستبدل البيانات التجريبية ببيانات الشكوى عند الإصدار.
          </p>
          <div className="rounded-xl overflow-hidden border border-border">
            <iframe
              title="معاينة مباشرة لنموذج الخطاب"
              sandbox=""
              srcDoc={livePreviewHtml}
              className="w-full min-h-[65vh] bg-white"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={variableModalOpen}
        onOpenChange={(open) => {
          if (!open) resetDraft();
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null
                ? "تعديل المتغير الداخلي"
                : "إضافة متغير داخلي"}
            </DialogTitle>
            <DialogDescription>
              متغير بقيمة ثابتة يحددها المشرف — تُستخدم عند إصدار الخطاب ولا
              يمكن تغييرها من طرف المستخدم.
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
              <Label htmlFor="var-label" className="text-label-sm font-bold">
                الاسم الظاهر (عربي) <span className="text-muted-foreground">— اختياري</span>
              </Label>
              <Input
                id="var-label"
                dir="auto"
                className="w-full text-label-sm"
                placeholder="مثال: رقم القرار"
                value={draftVariable.label ?? ""}
                aria-invalid={!!draftErrors.label}
                onChange={(e) =>
                  handleDraftChange("label", (d) => ({
                    ...d,
                    label: e.target.value,
                  }))
                }
              />
              {draftErrors.label && (
                <p className="text-label-xs text-destructive">
                  {draftErrors.label}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-label-sm font-bold">النوع</Label>
              <Select
                value={draftVariable.type ?? "text"}
                onValueChange={handleLocalTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LETTER_VARIABLE_TYPE_LABELS) as TemplateVariableType[]).map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {LETTER_VARIABLE_TYPE_LABELS[t]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {draftVariable.type === "image" ? (
              <div className="space-y-4 rounded-xl border border-border bg-surface-container-lowest p-4">
                <div className="space-y-1.5">
                  <Label className="text-label-sm font-bold">الصورة</Label>
                  <ImageUploadField
                    src={draftVariable.imageUrl || null}
                    busy={uploadMutation.isPending}
                    disabled={false}
                    onUpload={handleLocalUpload}
                    helper="PNG / JPG / WEBP حتى 5MB — تُستبدل تلقائياً عند إصدار الخطاب"
                  />
                  {draftErrors.image && (
                    <p className="text-label-xs text-destructive">
                      {draftErrors.image}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="var-fallback" className="text-label-sm font-bold">
                    النص الاحتياطي
                  </Label>
                  <Textarea
                    id="var-fallback"
                    dir="auto"
                    rows={2}
                    placeholder="يُستخدم هذا النص في حال عدم توفر الصورة عند الإصدار"
                    value={draftVariable.fallbackText ?? ""}
                    onChange={(e) => {
                      setDraftVariable((d) => ({
                        ...d,
                        fallbackText: e.target.value,
                      }));
                      setDraftErrors((prev) =>
                        prev.image ? { ...prev, image: undefined } : prev,
                      );
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="var-value" className="text-label-sm font-bold">
                    القيمة الثابتة
                  </Label>
                  <label className="flex items-center gap-2 text-label-sm text-muted-foreground">
                    <Checkbox
                      checked={useNow}
                      onCheckedChange={(checked) =>
                        handleDraftChange("defaultValue", (d) => ({
                          ...d,
                          defaultValue: checked === true ? LETTER_VARIABLE_NOW : "",
                        }))
                      }
                    />
                    الوقت الحالي عند الإصدار
                  </label>
                </div>
                {useNow ? (
                  <p className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-label-sm text-primary">
                    تُعبأ القيمة تلقائياً بتاريخ ووقت إصدار الخطاب لحظة الإنشاء.
                  </p>
                ) : (
                  <Input
                    id="var-value"
                    dir="auto"
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
                )}
                {draftErrors.defaultValue && (
                  <p className="text-label-xs text-destructive">
                    {draftErrors.defaultValue}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-label-sm">
              <Switch
                checked={draftVariable.required ?? false}
                onCheckedChange={(v) =>
                  setDraftVariable((d) => ({ ...d, required: v }))
                }
              />
              إلزامي — يجب توفير قيمته عند الإصدار
            </div>

            <p className="text-label-xs text-muted-foreground">
              المفتاح يبدأ بحرف إنجليزي ويمكن أن يحتوي أرقاماً ونقاطاً وأسفل سطر
              فقط — يُستخدم داخل {"{{}}"} في المحتوى، وتُدمج القيمة الثابتة أو
              الصورة تلقائياً عند إصدار الخطاب. الاسم الظاهر يظهر في القائمة
              الجانبية والمعاينة بدلاً من المفتاح.
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
                        label: draftVariable.label?.trim(),
                      },
                    ],
                    { shouldDirty: true },
                  );
                } else {
                  const next = templateVariables.map((v, i) =>
                    i === editingIndex
                      ? { ...draftVariable, key: v.key, label: draftVariable.label?.trim() }
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

      <ConfirmDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteIndex(null);
        }}
        title="حذف المتغير الداخلي"
        description={
          deleteIndex !== null
            ? `هل أنت متأكد من حذف المتغير "${
                templateVariables[deleteIndex]?.label?.trim() ||
                templateVariables[deleteIndex]?.key ||
                ""
              }"؟ سيُحذف من النموذج ولن تُستبدل قيمته في الخطابات القادمة.`
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