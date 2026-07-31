import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react";

import { PATHS } from "@/router/paths";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteUser } from "@/features/users/hooks";

interface UserActionsDropdownProps {
  userId: string;
  userName: string;
}

export function UserActionsDropdown({
  userId,
  userName,
}: UserActionsDropdownProps) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteUser();

  const handleEdit = () => navigate(PATHS.ADMIN.USER_DETAIL(userId));
  const handlePermissions = () => {};
  const handleDelete = () => setDeleteOpen(true);

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={handleEdit} className="w-full gap-2">
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePermissions} className="w-full gap-2">
            <Shield className="size-4" />
            إدارة الصلاحيات
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDelete}
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
        title="حذف الموظف"
        description={`هل أنت متأكد من حذف "${userName}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmLabel={deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
        cancelLabel="إلغاء"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(userId, {
            onSuccess: () => {
              toast.success("تم حذف المستخدم بنجاح");
              setDeleteOpen(false);
            },
          })
        }
      />
    </>
  );
}
