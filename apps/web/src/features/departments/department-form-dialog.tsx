import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateDepartment,
  useUpdateDepartment,
} from "@/features/departments/hooks";
import type { Department } from "@/features/departments/types";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}

const schema = z.object({
  name: z
    .string()
    .min(1, "اسم الجهة مطلوب")
    .max(200, "اسم الجهة يجب ألا يتجاوز 200 حرف"),
  subAuthority: z.string().max(200, "الجهة الفرعية يجب ألا تتجاوز 200 حرف").or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
}: DepartmentFormDialogProps) {
  const isEdit = !!department;
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", subAuthority: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: department?.name ?? "",
        subAuthority: department?.subAuthority ?? "",
      });
    }
  }, [open, department, reset]);

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: department!.id,
          name: values.name,
          subAuthority: values.subAuthority || undefined,
        },
        {
          onSuccess: () => {
            toast.success("تم تحديث الجهة بنجاح");
            onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(
      {
        name: values.name,
        subAuthority: values.subAuthority || undefined,
      },
      {
        onSuccess: () => {
          toast.success("تم إنشاء الجهة بنجاح");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل الجهة" : "إضافة جهة جديدة"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "قم بتعديل بيانات الجهة ثم احفظ التغييرات."
              : "أدخل بيانات الجهة الجديدة ليتم استخدامها في نموذج إنشاء الشكوى."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department-name">اسم الجهة</Label>
            <Input
              id="department-name"
              dir="rtl"
              placeholder="مثال: مديرية الصحة"
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
            <Label htmlFor="department-sub-authority">الجهة الفرعية</Label>
            <Input
              id="department-sub-authority"
              dir="rtl"
              placeholder="مثال: الوحدات الصحية (اختياري)"
              {...register("subAuthority")}
              aria-invalid={!!errors.subAuthority}
            />
            {errors.subAuthority && (
              <p className="text-destructive text-label-sm">
                {errors.subAuthority.message}
              </p>
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
              {isPending ? "جارٍ الحفظ..." : isEdit ? "حفظ التغييرات" : "إضافة الجهة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
