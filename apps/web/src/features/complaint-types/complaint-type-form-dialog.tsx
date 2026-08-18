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
  useCreateComplaintType,
  useUpdateComplaintType,
} from "@/features/complaint-types/hooks";
import type { ComplaintType } from "@/features/complaint-types/types";

interface ComplaintTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: ComplaintType | null;
}

const schema = z.object({
  name: z.string().min(1, "اسم الفئة مطلوب").max(100, "اسم الفئة يجب ألا يتجاوز 100 حرف"),
});

type FormValues = z.infer<typeof schema>;

export function ComplaintTypeFormDialog({
  open,
  onOpenChange,
  type,
}: ComplaintTypeFormDialogProps) {
  const isEdit = !!type;
  const createMutation = useCreateComplaintType();
  const updateMutation = useUpdateComplaintType();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ name: type?.name ?? "" });
    }
  }, [open, type, reset]);

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: type!.id, name: values.name },
        {
          onSuccess: () => {
            toast.success("تم تحديث الفئة بنجاح");
            onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(values.name, {
      onSuccess: () => {
        toast.success("تم إنشاء الفئة بنجاح");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "قم بتعديل اسم الفئة ثم احفظ التغييرات."
              : "أدخل اسم الفئة الجديدة ليتم استخدامها في نموذج إنشاء الشكوى."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complaint-type-name">اسم الفئة</Label>
            <Input
              id="complaint-type-name"
              dir="rtl"
              placeholder="مثال: خدمة، إداري، مالي"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-destructive text-label-sm">
                {errors.name.message}
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
              {isPending ? "جارٍ الحفظ..." : isEdit ? "حفظ التغييرات" : "إضافة الفئة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
