import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteReceptionMethod } from "@/features/reception-methods/hooks";

interface ReceptionMethodActionsDropdownProps {
  methodId: number;
  methodName: string;
  onEdit: () => void;
}

export function ReceptionMethodActionsDropdown({
  methodId,
  methodName,
  onEdit,
}: ReceptionMethodActionsDropdownProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteReceptionMethod();

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={onEdit} className="w-full gap-2">
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="w-full gap-2"
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="حذف طريقة الاستلام"
        description={`هل أنت متأكد من حذف "${methodName}"؟ لا يمكن حذف طرق الاستلام المستخدمة في شكاوى.`}
        confirmLabel={deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
        cancelLabel="إلغاء"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(methodId, {
            onSuccess: () => {
              toast.success("تم حذف طريقة الاستلام بنجاح");
              setDeleteOpen(false);
            },
          })
        }
      />
    </>
  );
}
