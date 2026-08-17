import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
  Ban,
  UserCheck,
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
import {
  useDeleteUser,
  useBlockUser,
  useUnblockUser,
} from "@/features/users/hooks";

interface UserActionsDropdownProps {
  userId: string;
  userName: string;
  userRole: string;
  isBlocked?: boolean;
}

export function UserActionsDropdown({
  userId,
  userName,
  userRole,
  isBlocked = false,
}: UserActionsDropdownProps) {
  const navigate = useNavigate();
  const currentRole = useAuthStore((s) => s.user?.role);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { userDetail, newUser } = useUserManagementPaths();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const deleteMutation = useDeleteUser();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const hasManagePermission =
    currentRole === "SuperAdmin"
      ? userRole !== "SuperAdmin"
      : currentRole === "Admin" && (userRole === "Official" || userRole === "");

  const canBlock = hasManagePermission && userId !== currentUserId;
  const blockPending = blockMutation.isPending || unblockMutation.isPending;

  const handleEdit = () => navigate(userDetail(userId));
  const handlePermissions = () => navigate(newUser);
  const handleDelete = () => setDeleteOpen(true);
  const handleBlock = () => setBlockOpen(true);

  if (!hasManagePermission) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
        لا يوجد صلاحية
      </span>
    );
  }

  const toggleBlock = () => {
    const mutation = isBlocked ? unblockMutation : blockMutation;
    mutation.mutate(userId, {
      onSuccess: () => {
        toast.success(isBlocked ? "تم إلغاء حظر المستخدم" : "تم حظر المستخدم");
        setBlockOpen(false);
      },
      onError: () => toast.error("تعذر تنفيذ العملية"),
    });
  };

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
          {canBlock && (
            <DropdownMenuItem onClick={handleBlock} className="w-full gap-2">
              {isBlocked ? (
                <UserCheck className="size-4" />
              ) : (
                <Ban className="size-4" />
              )}
              {isBlocked ? "إلغاء الحظر" : "حظر الحساب"}
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
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title={isBlocked ? "إلغاء حظر المستخدم" : "حظر المستخدم"}
        description={
          isBlocked
            ? `هل أنت متأكد من إلغاء حظر "${userName}"؟ سيتمكن من تسجيل الدخول مرة أخرى.`
            : `هل أنت متأكد من حظر "${userName}"؟ لن يستطيع تسجيل الدخول إلى النظام.`
        }
        confirmLabel={blockPending ? "جارٍ التنفيذ..." : isBlocked ? "إلغاء الحظر" : "حظر"}
        cancelLabel="إلغاء"
        variant={isBlocked ? "default" : "destructive"}
        loading={blockPending}
        onConfirm={toggleBlock}
      />

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