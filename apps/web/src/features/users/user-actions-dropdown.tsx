import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store";
import { useUserManagementPaths } from "@/features/users/use-user-management-paths";

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
  userRole: string;
}

export function UserActionsDropdown({
  userId,
  userName,
  userRole,
}: UserActionsDropdownProps) {
  const navigate = useNavigate();
  const currentRole = useAuthStore((s) => s.user?.role);
  const { userDetail, newUser } = useUserManagementPaths();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteUser();

  const hasManagePermission =
    currentRole === "SuperAdmin" ||
    (currentRole === "Admin" && (userRole === "Official" || userRole === ""));

  const handleEdit = () => navigate(userDetail(userId));
  const handlePermissions = () => navigate(newUser);
  const handleDelete = () => setDeleteOpen(true);

  if (!hasManagePermission) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
        لا يوجد صلاحية
      </span>
    );
  }

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
          {currentRole === "SuperAdmin" && (
            <DropdownMenuItem
              onClick={handlePermissions}
              className="w-full gap-2"
            >
              <Shield className="size-4" />
              إدارة الصلاحيات
            </DropdownMenuItem>
          )}
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
