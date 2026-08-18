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
  useCreateReceptionMethod,
  useUpdateReceptionMethod,
} from "@/features/reception-methods/hooks";
import type { ReceptionMethod } from "@/features/reception-methods/types";

interface ReceptionMethodFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: ReceptionMethod | null;
}

const schema = z.object({
  name: z
    .string()
    .min(1, "اسم طريقة الاستلام مطلوب")
    .max(100, "اسم طريقة الاستلام يجب ألا يتجاوز 100 حرف"),
});

type FormValues = z.infer<typeof schema>;

export function ReceptionMethodFormDialog({
  open,
  onOpenChange,
  method,
}: ReceptionMethodFormDialogProps) {
  const isEdit = !!method;
  const createMutation = useCreateReceptionMethod();
  const updateMutation = useUpdateReceptionMethod();
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
      reset({ name: method?.name ?? "" });
    }
  }, [open, method, reset]);

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: method!.id, name: values.name },
        {
          onSuccess: () => {
            toast.success("تم تحديث طريقة الاستلام بنجاح");
            onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(values.name, {
      onSuccess: () => {
        toast.success("تم إنشاء طريقة الاستلام بنجاح");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل طريقة الاستلام" : "إضافة طريقة استلام جديدة"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "قم بتعديل اسم طريقة الاستلام ثم احفظ التغييرات."
              : "أدخل اسم طريقة الاستلام الجديدة ليتم استخدامها في نموذج إنشاء الشكوى."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reception-method-name">اسم طريقة الاستلام</Label>
            <Input
              id="reception-method-name"
              dir="rtl"
              placeholder="مثال: يدوي، هاتف، بريد"
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
              {isPending ? "جارٍ الحفظ..." : isEdit ? "حفظ التغييرات" : "إضافة طريقة الاستلام"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
