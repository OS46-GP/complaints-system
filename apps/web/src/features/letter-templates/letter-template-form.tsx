import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  FileUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  WysiwygEditor,
  type WysiwygEditorHandle,
} from "@/components/shared/wysiwyg-editor";
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
  variables: z.array(
    z.object({
      key: z.string().min(1, "المفتاح مطلوب"),
      label: z.string().min(1, "الاسم مطلوب"),
      required: z.boolean().optional(),
      placeholder: z.string().optional(),
      type: z.enum(["text", "textarea", "date"]).optional(),
      group: z.string().optional(),
    }),
  ),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

export function LetterTemplateForm({ template }: LetterTemplateFormProps) {
  const isEdit = !!template;
  const navigate = useNavigate();
  const docxInputRef = useRef<HTMLInputElement>(null);
  const wysiwygRef = useRef<WysiwygEditorHandle>(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [draftVariable, setDraftVariable] = useState<TemplateVariable>({
    key: "",
    label: "",
    required: false,
    type: "text",
  });
  const createMutation = useCreateLetterTemplate();
  const updateMutation = useUpdateLetterTemplate();
  const importMutation = useImportLetterTemplateDocx();
  const { data: placeholderGroups } = useLetterPlaceholders();
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    importMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
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

  const templateVariables = (watch("variables") ?? []) as TemplateVariable[];

  const insertPlaceholder = (key: string) => {
    if (wysiwygRef.current) {
      wysiwygRef.current.insertHtml(` {{${key}}} `);
      return;
    }
    const value = getValues("body") ?? "";
    setValue("body", `${value} {{${key}}}`, { shouldDirty: true });
  };

  const bodyValue = watch("body") ?? "";
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
                className="flex items-center justify-between w-full border-b border-border bg-surface-container-lowest px-3 py-2 text-label-sm font-bold text-muted-foreground hover:bg-accent transition-colors"
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
              <div className="flex items-center gap-2">
                <p className="text-label-sm font-bold text-muted-foreground">
                  متغيرات خاصة بهذا النموذج
                </p>
                {templateVariables.length > 0 && (
                  <span className="rounded-full bg-primary/10 text-primary text-label-xs px-2 py-0.5">
                    {templateVariables.length}
                  </span>
                )}
              </div>

              {templateVariables.length === 0 ? (
                <p className="text-label-sm text-muted-foreground">
                  لا توجد متغيرات خاصة بعد. أضف متغيرات يحددها المستخدم عند
                  إصدار الخطاب (مثل رقم القرار، اسم المأمورية، الرقم القانوني...).
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
                        <span className="text-label-sm font-medium">
                          {v.label}
                        </span>
                        {v.required && (
                          <span className="rounded-full bg-destructive/10 text-destructive text-label-xs px-2 py-0.5">
                            مطلوب
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ms-auto size-6 text-destructive"
                        onClick={() => {
                          const next = templateVariables.filter(
                            (_, i) => i !== idx,
                          );
                          setValue("variables", next, { shouldDirty: true });
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
                        title={v.label}
                      >
                        {`{{${v.key}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-label-sm font-bold text-muted-foreground">
                  إضافة متغير جديد
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    dir="ltr"
                    className="w-44 font-mono text-label-sm"
                    placeholder="id: variableName"
                    value={draftVariable.key}
                    aria-label="مفتاح المتغير"
                    onChange={(e) =>
                      setDraftVariable((d) => ({
                        ...d,
                        key: e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""),
                      }))
                    }
                  />
                  <Input
                    className="w-52 text-label-sm"
                    placeholder="اسم المتغير الظاهر للمستخدم"
                    value={draftVariable.label}
                    aria-label="اسم المتغير"
                    onChange={(e) =>
                      setDraftVariable((d) => ({
                        ...d,
                        label: e.target.value,
                      }))
                    }
                  />
                  <label className="flex items-center gap-1.5 text-label-sm">
                    <Switch
                      checked={draftVariable.required}
                      onCheckedChange={(v) =>
                        setDraftVariable((d) => ({ ...d, required: v }))
                      }
                    />
                    مطلوب
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={
                      !draftVariable.key.trim() || !draftVariable.label.trim()
                    }
                    onClick={() => {
                      if (
                        templateVariables.some(
                          (v) => v.key === draftVariable.key,
                        )
                      ) {
                        return;
                      }
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
                      setDraftVariable({
                        key: "",
                        label: "",
                        required: false,
                        type: "text",
                      });
                    }}
                  >
                    <Plus className="size-4" />
                    إضافة
                  </Button>
                </div>
                <p className="text-label-xs text-muted-foreground">
                  المفتاح يبدأ بحرف إنجليزي ويمكن أن يحتوي أرقاماً ونقاطاً
                  وأسفل سطر فقط — يُستخدم داخل {"{{}}"} في المحتوى.
                </p>
              </div>
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
                  checked={watch("isActive")}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
                مفعّل
              </label>
              <label className="flex items-center gap-2 text-label-sm">
                <Switch
                  checked={watch("isDefault")}
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
  );
}