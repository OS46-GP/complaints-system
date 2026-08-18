import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import {
  useCreateLetterVariable,
  useUpdateLetterVariable,
  useUploadLetterVariableImage,
} from "@/features/letter-variables/hooks";
import {
  LETTER_VARIABLE_NOW,
  LETTER_VARIABLE_TYPE_LABELS,
  type LetterVariable,
  type LetterVariableType,
} from "@/features/letter-variables/types";

interface LetterVariableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variable?: LetterVariable | null;
}

const schema = z.object({
  key: z
    .string()
    .min(1, "المفتاح مطلوب")
    .max(64, "المفتاح يجب ألا يتجاوز 64 حرفاً")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_.]*$/,
      "المفتاح يجب أن يبدأ بحرف إنجليزي ويحتوي أرقاماً ونقاطاً وأسفل سطر فقط",
    ),
  labelAr: z
    .string()
    .min(1, "الاسم بالعربية مطلوب")
    .max(200, "الاسم يجب ألا يتجاوز 200 حرف"),
  type: z.enum(["text", "textarea", "date", "image"]),
  defaultValue: z
    .string()
    .max(2000, "القيمة الافتراضية يجب ألا تتجاوز 2000 حرف")
    .optional(),
  imageUrl: z
    .string()
    .max(500, "رابط الصورة يجب ألا يتجاوز 500 حرف")
    .optional(),
  fallbackText: z
    .string()
    .max(500, "النص الاحتياطي يجب ألا يتجاوز 500 حرف")
    .optional(),
  required: z.boolean(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  key: "",
  labelAr: "",
  type: "text",
  defaultValue: "",
  imageUrl: "",
  fallbackText: "",
  required: false,
  isActive: true,
};

export function LetterVariableFormDialog({
  open,
  onOpenChange,
  variable,
}: LetterVariableFormDialogProps) {
  const isEdit = !!variable;
  const isSystem = variable?.isSystem ?? false;
  const createMutation = useCreateLetterVariable();
  const updateMutation = useUpdateLetterVariable();
  const uploadMutation = useUploadLetterVariableImage();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(
        variable
          ? {
              key: variable.key,
              labelAr: variable.labelAr,
              type: variable.type,
              defaultValue: variable.defaultValue ?? "",
              imageUrl: variable.imageUrl ?? "",
              fallbackText: variable.fallbackText ?? "",
              required: variable.required,
              isActive: variable.isActive,
            }
          : EMPTY,
      );
    }
  }, [open, variable, reset]);

  const typeValue = useWatch<FormValues, "type">({
    control,
    name: "type",
    defaultValue: "text" as LetterVariableType,
  });
  const requiredValue = useWatch<FormValues, "required">({
    control,
    name: "required",
    defaultValue: false,
  });
  const isActiveValue = useWatch<FormValues, "isActive">({
    control,
    name: "isActive",
    defaultValue: true,
  });
  const defaultValueValue = useWatch<FormValues, "defaultValue">({
    control,
    name: "defaultValue",
    defaultValue: "",
  });
  const imageUrlValue = useWatch<FormValues, "imageUrl">({
    control,
    name: "imageUrl",
    defaultValue: "",
  });
  const useNow = defaultValueValue?.trim() === LETTER_VARIABLE_NOW;
  const isImage = typeValue === "image";

  const handleTypeChange = (value: string) => {
    const next = value as LetterVariableType;
    setValue("type", next, { shouldDirty: true });
    if (next === "image") {
      setValue("defaultValue", "", { shouldDirty: true });
    } else {
      setValue("imageUrl", "", { shouldDirty: true });
      setValue("fallbackText", "", { shouldDirty: true });
    }
  };

  const handleUpload = (file: File) => {
    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        setValue("imageUrl", result.downloadUrl, { shouldDirty: true });
      },
    });
  };

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: variable!.id,
          payload: {
            labelAr: values.labelAr,
            type: values.type,
            defaultValue: values.defaultValue,
            imageUrl: values.imageUrl,
            fallbackText: values.fallbackText,
            required: values.required,
            isActive: values.isActive,
          },
        },
        {
          onSuccess: () => onOpenChange(false),
          onError: () => undefined,
        },
      );
      return;
    }
    createMutation.mutate(values, {
      onSuccess: () => onOpenChange(false),
      onError: () => undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل المتغير" : "إضافة متغير جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "قم بتعديل بيانات المتغير ثم احفظ التغييرات. المفتاح لا يمكن تغييره بعد الإنشاء."
              : "أنشئ متغيراً عاماً جديداً ليظهر في قائمة المتغيرات عند تحرير نماذج الخطابات."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lv-key">المفتاح</Label>
              <Input
                id="lv-key"
                dir="ltr"
                className="font-mono text-label-sm"
                placeholder="variableName"
                {...register("key")}
                aria-invalid={!!errors.key}
                disabled={isEdit}
              />
              {errors.key && (
                <p className="text-destructive text-label-sm">
                  {errors.key.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lv-label">الاسم الظاهر (عربي)</Label>
              <Input
                id="lv-label"
                dir="auto"
                placeholder="مثال: رقم القرار"
                {...register("labelAr")}
                aria-invalid={!!errors.labelAr}
              />
              {errors.labelAr && (
                <p className="text-destructive text-label-sm">
                  {errors.labelAr.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select
                value={typeValue}
                onValueChange={handleTypeChange}
                disabled={isSystem}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LETTER_VARIABLE_TYPE_LABELS) as LetterVariableType[]).map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {LETTER_VARIABLE_TYPE_LABELS[t]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isImage ? (
            <div className="space-y-4 rounded-xl border border-border bg-surface-container-lowest p-4">
              <div className="space-y-2">
                <Label>الصورة</Label>
                <ImageUploadField
                  src={imageUrlValue || null}
                  busy={uploadMutation.isPending}
                  disabled={isSystem}
                  onUpload={handleUpload}
                  helper="PNG / JPG / WEBP حتى 5MB — تُستبدل تلقائياً عند إصدار الخطاب"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lv-fallback">النص الاحتياطي</Label>
                <Textarea
                  id="lv-fallback"
                  dir="rtl"
                  rows={2}
                  placeholder="يُستخدم هذا النص في حال عدم توفر الصورة عند الإصدار"
                  {...register("fallbackText")}
                  disabled={isSystem}
                  aria-invalid={!!errors.fallbackText}
                />
                {errors.fallbackText && (
                  <p className="text-destructive text-label-sm">
                    {errors.fallbackText.message}
                  </p>
                )}
              </div>

              {isSystem && (
                <p className="text-label-xs text-muted-foreground">
                  صورة المتغيرات الأساسية تُؤخذ من إعدادات الجهة والخطابات — لا
                  يمكن تغييرها من هنا.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="lv-default">القيمة الافتراضية</Label>
                <label className="flex items-center gap-2 text-label-sm text-muted-foreground">
                  <Checkbox
                    checked={useNow}
                    onCheckedChange={(checked) => {
                      setValue(
                        "defaultValue",
                        checked === true ? LETTER_VARIABLE_NOW : "",
                        { shouldDirty: true },
                      );
                    }}
                    disabled={isSystem}
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
                  id="lv-default"
                  dir="rtl"
                  placeholder="تُدمج تلقائياً عند إصدار الخطاب عند استخدام {{key}} في المحتوى"
                  {...register("defaultValue")}
                  aria-invalid={!!errors.defaultValue}
                  disabled={isSystem}
                />
              )}
              {errors.defaultValue && (
                <p className="text-destructive text-label-sm">
                  {errors.defaultValue.message}
                </p>
              )}
              {isSystem && (
                <p className="text-label-xs text-muted-foreground">
                  المتغيرات الأساسية تُستبدل تلقائياً من بيانات الشكوى وبيانات
                  الجهة — لا حاجة لقيمة افتراضية.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-border bg-surface-container-lowest p-3">
            <label className="flex items-center gap-2 text-label-sm">
              <Switch
                checked={requiredValue}
                onCheckedChange={(v) => setValue("required", v)}
                disabled={isSystem}
              />
              إلزامي
            </label>
            <label className="flex items-center gap-2 text-label-sm">
              <Switch
                checked={isActiveValue}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
              مفعّل
            </label>
            {isSystem && (
              <span className="text-label-xs text-muted-foreground">
                "إلزامي" لا ينطبق على المتغيرات الأساسية.
              </span>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending
                ? "جارٍ الحفظ..."
                : isEdit
                  ? "حفظ التغييرات"
                  : "إضافة المتغير"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}