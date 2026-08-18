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
import { useDeleteDepartment } from "@/features/departments/hooks";

interface DepartmentActionsDropdownProps {
  departmentId: string;
  departmentName: string;
  onEdit: () => void;
}

export function DepartmentActionsDropdown({
  departmentId,
  departmentName,
  onEdit,
}: DepartmentActionsDropdownProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteDepartment();

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
        title="حذف الجهة"
        description={`هل أنت متأكد من حذف "${departmentName}"؟ لا يمكن حذف الجهات المستخدمة في شكاوى.`}
        confirmLabel={deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
        cancelLabel="إلغاء"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(departmentId, {
            onSuccess: () => {
              toast.success("تم حذف الجهة بنجاح");
              setDeleteOpen(false);
            },
          })
        }
      />
    </>
  );
}
