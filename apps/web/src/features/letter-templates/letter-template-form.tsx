import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { PATHS } from "@/router/paths";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateLetterTemplate,
  useLetterPlaceholders,
  usePreviewLetterTemplate,
  useUpdateLetterTemplate,
} from "@/features/letter-templates/hooks";
import type { LetterTemplate } from "@/features/letter-templates/types";
import { renderLetterPreview } from "@/features/letter-templates/live-preview";

interface LetterTemplateFormProps {
  template?: LetterTemplate | null;
}

const schema = z.object({
  name: z.string().min(1, "اسم النموذج مطلوب").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["HTML", "DOCX", "PDF_LETTERHEAD"]),
  body: z.string().optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

export function LetterTemplateForm({ template }: LetterTemplateFormProps) {
  const isEdit = !!template;
  const navigate = useNavigate();
  const createMutation = useCreateLetterTemplate();
  const updateMutation = useUpdateLetterTemplate();
  const previewMutation = usePreviewLetterTemplate();
  const { data: placeholderGroups } = useLetterPlaceholders();
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    previewMutation.isPending;

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
      name: "",
      description: "",
      type: "HTML",
      body: "",
      isActive: true,
      isDefault: false,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    reset({
      name: template?.name ?? "",
      description: template?.description ?? "",
      type: template?.type ?? "HTML",
      body: template?.body ?? "",
      isActive: template?.isActive ?? true,
      isDefault: template?.isDefault ?? false,
      sortOrder: template?.sortOrder ?? 0,
    });
  }, [template, reset]);

  const insertPlaceholder = (key: string) => {
    const value = getValues("body") ?? "";
    setValue("body", `${value} {{${key}}}`, { shouldDirty: true });
  };

  const bodyValue = watch("body") ?? "";
  const livePreviewHtml = useMemo(
    () => renderLetterPreview(bodyValue),
    [bodyValue],
  );

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="lt-type">نوع النموذج</Label>
              <Select
                value="HTML"
                onValueChange={(v) =>
                  setValue("type", v as FormValues["type"])
                }
                disabled
              >
                <SelectTrigger id="lt-type">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTML">HTML (مدعوم حالياً)</SelectItem>
                  <SelectItem value="DOCX" disabled>
                    DOCX (قريباً)
                  </SelectItem>
                  <SelectItem value="PDF_LETTERHEAD" disabled>
                    ترويسة PDF (قريباً)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="lt-body">محتوى الخطاب (HTML)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => isEdit && previewMutation.mutate(template!.id)}
                disabled={!isEdit || previewMutation.isPending}
              >
                <Eye className="size-4" />
                {previewMutation.isPending
                  ? "جارٍ إنشاء PDF..."
                  : "معاينة النموذج كـ PDF"}
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Textarea
                id="lt-body"
                dir="rtl"
                rows={18}
                className="min-h-[440px] resize-y font-mono"
                placeholder={`<div class="letter-head">... بشكل HTML، مع إدراج المتغيرات مثل: {{citizenName}} {{subject}}`}
                {...register("body")}
              />
              <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-white">
                <div className="border-b border-border bg-surface-container-lowest px-3 py-2 text-label-sm font-bold text-muted-foreground flex items-center justify-between">
                  <span>معاينة مباشرة</span>
                  <span className="text-label-xs font-normal text-muted-foreground/70">
                    بيانات تجريبية — تُستبدل ببيانات الشكوى الفعلية عند الإصدار
                  </span>
                </div>
                <iframe
                  title="معاينة مباشرة لنموذج الخطاب"
                  sandbox=""
                  srcDoc={livePreviewHtml}
                  className="w-full flex-1 min-h-[440px] bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>المتغيرات المتاحة (اضغط للإدراج)</Label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto border border-border rounded-xl p-3 bg-surface-container-lowest">
              {placeholderGroups?.length
                ? placeholderGroups.map((group) => (
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
                  ))
                : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
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
              <span>ترتيب العرض:</span>
              <Input
                type="number"
                className="w-24"
                min={0}
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </label>
          </div>

          <div className="flex items-center justify-start gap-2 pt-2 border-t border-border">
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