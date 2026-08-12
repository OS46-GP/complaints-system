import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Loader2, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useLetterSettings,
  useUpdateLetterSettings,
  useUploadLetterImage,
} from "@/features/letter-settings/hooks";
import { resolveDownloadUrl } from "@/features/reporting/api";

const schema = z.object({
  organizationNameAr: z.string().max(200).optional(),
  organizationNameEn: z.string().max(200).optional(),
  organizationAddress: z.string().max(500).optional(),
  organizationPhone: z.string().max(100).optional(),
  organizationFax: z.string().max(100).optional(),
  organizationEmail: z.string().max(200).optional(),
  organizationWebsite: z.string().max(200).optional(),
  managerName: z.string().max(200).optional(),
  managerTitle: z.string().max(200).optional(),
  responseDefaultDays: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

function ImageUploadField({
  label,
  src,
  busy,
  onUpload,
  helper,
}: {
  label: string;
  src: string | null;
  busy: boolean;
  onUpload: (file: File) => void;
  helper?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-3 border border-border rounded-xl p-3 bg-surface-container-lowest">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        {src ? (
          <img
            src={resolveDownloadUrl(src)}
            alt={label}
            className="max-h-36 rounded-lg border border-border bg-white object-contain"
          />
        ) : (
          <div className="h-24 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-label-sm">
            لا توجد صورة بعد
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : src ? (
            <RefreshCw className="size-4" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {busy ? "جارٍ الرفع..." : src ? "تغيير الصورة" : "رفع صورة"}
        </Button>
        {helper && <p className="text-label-sm text-muted-foreground">{helper}</p>}
      </div>
    </div>
  );
}

export function LetterSettingsForm() {
  const { data: settings, isLoading, isError, refetch } = useLetterSettings();
  const updateMutation = useUpdateLetterSettings();
  const uploadMutation = useUploadLetterImage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      responseDefaultDays: 15,
    },
  });

  const loadedRef = useRef(false);
  useEffect(() => {
    if (settings && !loadedRef.current) {
      loadedRef.current = true;
      reset({
        organizationNameAr: settings.organizationNameAr ?? "",
        organizationNameEn: settings.organizationNameEn ?? "",
        organizationAddress: settings.organizationAddress ?? "",
        organizationPhone: settings.organizationPhone ?? "",
        organizationFax: settings.organizationFax ?? "",
        organizationEmail: settings.organizationEmail ?? "",
        organizationWebsite: settings.organizationWebsite ?? "",
        managerName: settings.managerName ?? "",
        managerTitle: settings.managerTitle ?? "",
        responseDefaultDays: settings.responseDefaultDays ?? 15,
      });
    }
  }, [settings, reset]);

  const isBusy = updateMutation.isPending;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="بيانات الجهة والخطابات"
        description="البيانات الثابتة المستخدمة داخل نماذج الخطابات مثل اسم الجهة واسم المدير والتوقيع"
      />

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل بيانات الجهة"
        skeleton={<Skeleton className="h-48 rounded-xl" />}
      >
        <form onSubmit={handleSubmit((values) => updateMutation.mutate(values))} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>بيانات الجهة</CardTitle>
              <CardDescription>
                تظهر هذه البيانات في ترويسة ومحتوى الخطابات عند استخدام متغيراتها
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ls-name-ar">اسم الجهة (عربي)</Label>
                <Input id="ls-name-ar" dir="rtl" {...register("organizationNameAr")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ls-name-en">اسم الجهة (إنجليزي)</Label>
                <Input id="ls-name-en" dir="ltr" {...register("organizationNameEn")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ls-address">العنوان</Label>
                <Input id="ls-address" dir="rtl" {...register("organizationAddress")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ls-phone">الهاتف</Label>
                <Input id="ls-phone" dir="rtl" {...register("organizationPhone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ls-fax">الفاكس</Label>
                <Input id="ls-fax" dir="rtl" {...register("organizationFax")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ls-email">البريد الإلكتروني</Label>
                <Input id="ls-email" dir="ltr" type="email" {...register("organizationEmail")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ls-website">الموقع الإلكتروني</Label>
                <Input id="ls-website" dir="ltr" {...register("organizationWebsite")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>صاحب التوقيع</CardTitle>
              <CardDescription>
                اسم وصفة من يوقّع الخطابات والقيم المستخدمة في المتغيرات
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ls-mgr-name">اسم المدير</Label>
                <Input id="ls-mgr-name" dir="rtl" {...register("managerName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ls-mgr-title">صفة المدير</Label>
                <Input id="ls-mgr-title" dir="rtl" {...register("managerTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ls-days">مدة الرد المطلوبة (أيام)</Label>
                <Input
                  id="ls-days"
                  type="number"
                  min={0}
                  {...register("responseDefaultDays", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الصور والترويسة</CardTitle>
              <CardDescription>
                ترويسة الجهة والتوقيع والختم الرسمي — تُستبدل تلقائياً داخل نموذج
                الخطاب عند استخدام متغيراتها
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploadField
                label="ترويسة الجهة ({{organizationLetterhead}})"
                src={settings?.organizationLetterheadUrl ?? null}
                busy={uploadMutation.isPending && uploadMutation.variables?.field === "organizationLetterhead"}
                onUpload={(file) => uploadMutation.mutate({ field: "organizationLetterhead", file })}
                helper="PNG / JPG حتى 5MB"
              />
              <ImageUploadField
                label="توقيع المدير ({{managerSignature}})"
                src={settings?.managerSignatureUrl ?? null}
                busy={uploadMutation.isPending && uploadMutation.variables?.field === "managerSignature"}
                onUpload={(file) => uploadMutation.mutate({ field: "managerSignature", file })}
                helper="PNG / JPG حتى 5MB — خلفية شفافة مفضّلة"
              />
              <ImageUploadField
                label="الختم الرسمي ({{seal}})"
                src={settings?.sealUrl ?? null}
                busy={uploadMutation.isPending && uploadMutation.variables?.field === "seal"}
                onUpload={(file) => uploadMutation.mutate({ field: "seal", file })}
                helper="PNG / JPG حتى 5MB — خلفية شفافة مفضّلة"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isBusy || !isDirty}
              className="gap-2"
            >
              {isBusy && <Loader2 className="size-4 animate-spin" />}
              حفظ البيانات
            </Button>
          </div>
        </form>
      </AsyncLoader>
    </div>
  );
}