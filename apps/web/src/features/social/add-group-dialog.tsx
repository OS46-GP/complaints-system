import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAddGroup } from "@/features/social/hooks";
import type { GroupType } from "@/features/social/types";

const schema = z.object({
  name: z.string().min(1, "اسم المجموعة أو الصفحة مطلوب"),
  groupId: z.string().min(1, "معرّف المجموعة أو الصفحة مطلوب"),
  type: z.enum(["Group", "Page"]),
});

type FormData = z.infer<typeof schema>;

export function AddGroupDialog() {
  const [open, setOpen] = useState(false);
  const mutation = useAddGroup();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", groupId: "", type: "Group" },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const type = watch("type");

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      { ...data, type: data.type as GroupType },
      {
        onSuccess: () => {
          toast.success("تمت إضافة المجموعة أو الصفحة للمراقبة");
          setOpen(false);
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "تعذر الإضافة للمراقبة";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="size-5" />
        <span>إضافة مجموعة أو صفحة</span>
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة مجموعة أو صفحة للمراقبة</DialogTitle>
          <DialogDescription>
            أدخل بيانات المجموعة أو الصفحة التي سيتم تتبع منشوراتها على فيسبوك
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">اسم المجموعة أو الصفحة</Label>
            <Input
              id="group-name"
              placeholder="مثال: شبين الكوم"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="group-id">معرّف المجموعة أو الصفحة (ID)</Label>
            <Input
              id="group-id"
              placeholder="مثال: 851613538947931"
              dir="ltr"
              className="text-start"
              {...register("groupId")}
              aria-invalid={!!errors.groupId}
            />
            {errors.groupId && (
              <p className="text-sm text-destructive">{errors.groupId.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>النوع</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue("type", value as GroupType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Group">مجموعة</SelectItem>
                <SelectItem value="Page">صفحة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {mutation.isPending ? "جارٍ الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
