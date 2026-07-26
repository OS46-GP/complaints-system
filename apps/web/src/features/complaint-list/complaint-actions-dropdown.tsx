import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  MoreHorizontal,
  Eye,
  Reply,
  MessageSquare,
  XCircle,
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

interface ComplaintActionsDropdownProps {
  complaintId: string;
}

export function ComplaintActionsDropdown({
  complaintId,
}: ComplaintActionsDropdownProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  const detailPath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_DETAIL(complaintId)
    : PATHS.USER.COMPLAINT_DETAIL(complaintId);

  const handleView = () => navigate(detailPath);
  const handleResponse = () => {};
  const handleComment = () => {};
  const handleClose = () => {};
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleResponse} className="w-full gap-2">
            <Reply className="size-4" />
            إضافة رد
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleComment} className="w-full gap-2">
            <MessageSquare className="size-4" />
            إضافة تعليق
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClose} className="w-full gap-2">
            <XCircle className="size-4" />
            إغلاق الشكوى
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
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="destructive"
        onConfirm={() => {
          console.log("Delete complaint #", complaintId);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
