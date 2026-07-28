import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PATHS } from "@/router/paths";
import { complaintsApi } from "@/features/complaint-list/api";

interface ComplaintActionsDropdownProps {
  complaintId: string;
}

export function ComplaintActionsDropdown({
  complaintId,
}: ComplaintActionsDropdownProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const isAdmin = pathname.startsWith("/admin");

  const detailPath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_DETAIL(complaintId)
    : PATHS.USER.COMPLAINT_DETAIL(complaintId);
  const editPath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_EDIT(complaintId)
    : PATHS.USER.COMPLAINT_EDIT(complaintId);

  const deleteMutation = useMutation({
    mutationFn: () => complaintsApi.remove(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("تم حذف الشكوى بنجاح");
      setDeleteOpen(false);
    },
  });

  const handleView = () => navigate(detailPath);
  const handleEdit = () => navigate(editPath);
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
          <DropdownMenuItem onClick={handleView} className="w-full gap-2">
            <Eye className="size-4" />
            عرض التفاصيل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit} className="w-full gap-2">
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDelete}
            className="w-full gap-2"
          >
            <Trash2 className="size-4" />
            حذف الشكوى
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="حذف الشكوى"
        description="هل أنت متأكد من حذف هذه الشكوى؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmLabel={deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
        cancelLabel="إلغاء"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
