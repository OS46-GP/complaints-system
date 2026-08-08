import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  MessageSquareReply,
  Archive,
  Sparkles,
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
import { ComplaintSummaryDialog } from "@/components/shared/complaint-summary-dialog";
import { ComplaintPdfButton } from "@/components/shared/complaint-pdf-button";
import { useDeleteComplaint } from "@/features/complaint-list/hooks";
import { PATHS } from "@/router/paths";

interface ComplaintActionsDropdownProps {
  complaintId: string;
  complaintLabel?: string;
}

export function ComplaintActionsDropdown({
  complaintId,
  complaintLabel,
}: ComplaintActionsDropdownProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const deleteMutation = useDeleteComplaint();
  const isAdmin = pathname.startsWith("/admin");
  const detailPath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_DETAIL(complaintId)
    : PATHS.USER.COMPLAINT_DETAIL(complaintId);
  const editPath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_EDIT(complaintId)
    : PATHS.USER.COMPLAINT_EDIT(complaintId);
  const responsePath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_RESPONSE(complaintId)
    : PATHS.USER.COMPLAINT_RESPONSE(complaintId);
  const archivePath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_ARCHIVE(complaintId)
    : PATHS.USER.COMPLAINT_ARCHIVE(complaintId);

  const handleView = () => navigate(detailPath);
  const handleEdit = () => navigate(editPath);
  const handleResponse = () => navigate(responsePath);
  const handleArchive = () => navigate(archivePath);
  const handleDelete = () => setDeleteOpen(true);
  const handleSummary = () => setSummaryOpen(true);

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
          <DropdownMenuItem onClick={handleSummary} className="w-full gap-2">
            <Sparkles className="size-4 text-primary" />
            الملخص الذكي
          </DropdownMenuItem>
          <ComplaintPdfButton
            complaintId={complaintId}
            variant="menu-item"
            label="طباعة PDF"
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit} className="w-full gap-2">
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResponse} className="w-full gap-2">
            <MessageSquareReply className="size-4" />
            إضافة رد
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive} className="w-full gap-2">
            <Archive className="size-4" />
            أرشفة
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
        onConfirm={() =>
          deleteMutation.mutate(complaintId, {
            onSuccess: () => {
              toast.success("تم حذف الشكوى بنجاح");
              setDeleteOpen(false);
            },
          })
        }
      />

      <ComplaintSummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        complaintId={complaintId}
        complaintLabel={complaintLabel ?? complaintId}
      />
    </>
  );
}
