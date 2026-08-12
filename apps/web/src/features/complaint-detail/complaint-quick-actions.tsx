import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Pencil,
  MessageSquareReply,
  Archive,
  Sparkles,
  Printer,
  CheckCircle2,
  ChevronLeft,
  Repeat,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ComplaintSummaryDialog } from "@/components/shared/complaint-summary-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useGenerateComplaintPdf } from "@/features/complaint-list/hooks";
import { useUpdateCaseStatus } from "@/features/complaint-detail/hooks";

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ComplaintQuickActionsProps {
  complaintId: string;
  complaintLabel?: string;
  caseStatus?: "FINISHED" | "NOT_FINISHED" | null;
}

export function ComplaintQuickActions({
  complaintId,
  complaintLabel,
  caseStatus,
}: ComplaintQuickActionsProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const pdfMutation = useGenerateComplaintPdf();
  const caseStatusMutation = useUpdateCaseStatus(complaintId);
  const isAdmin = pathname.startsWith("/admin");
  const editPath = isAdmin
    ? `/admin/complaints/${complaintId}/edit`
    : `/user/complaints/${complaintId}/edit`;
  const responsePath = isAdmin
    ? `/admin/complaints/${complaintId}/response`
    : `/user/complaints/${complaintId}/response`;
  const reassignPath = isAdmin
    ? `/admin/complaints/${complaintId}/reassign`
    : `/user/complaints/${complaintId}/reassign`;
  const urgencyPath = isAdmin
    ? `/admin/complaints/${complaintId}/urgency`
    : `/user/complaints/${complaintId}/urgency`;
  const archivePath = isAdmin
    ? `/admin/complaints/${complaintId}/archive`
    : `/user/complaints/${complaintId}/archive`;

  const isFinished = caseStatus === "FINISHED";

  const actions: ActionItem[] = [
    { icon: <Sparkles className="size-5" />, label: "الملخص الذكي", onClick: () => setSummaryOpen(true) },
    { icon: <Pencil className="size-5" />, label: "تعديل الشكوى", onClick: () => navigate(editPath) },
    { icon: <MessageSquareReply className="size-5" />, label: "إضافة رد", onClick: () => navigate(responsePath) },
    { icon: <Repeat className="size-5" />, label: "إعادة إحالة", onClick: () => navigate(reassignPath) },
    { icon: <Zap className="size-5" />, label: "استعجال", onClick: () => navigate(urgencyPath) },
    { icon: <Archive className="size-5" />, label: "أرشفة", onClick: () => navigate(archivePath) },
    { icon: <Printer className="size-5" />, label: "طباعة", onClick: () => pdfMutation.mutate(complaintId) },
    {
      icon: <CheckCircle2 className="size-5" />,
      label: isFinished ? "إعادة فتح الشكوى" : "إغلاق الشكوى",
      variant: isFinished ? "default" : "destructive",
      onClick: () => setCloseConfirmOpen(true),
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <h4 className="font-heading text-label-sm text-foreground font-bold mb-4">
        إجراءات سريعة
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={
              action.variant === "destructive"
                ? "w-full py-3 px-4 bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 transition-colors rounded-lg flex items-center justify-between group"
                : "w-full py-3 px-4 border border-border hover:bg-surface-container-high transition-colors rounded-lg flex items-center justify-between group"
            }
          >
            <span className="flex items-center gap-3">
              <span
                className={
                  action.variant === "destructive"
                    ? "text-destructive"
                    : "text-muted-foreground group-hover:text-primary transition-colors"
                }
              >
                {action.icon}
              </span>
              <span
                className={
                  action.variant === "destructive"
                    ? "font-heading text-label-sm text-destructive font-bold"
                    : "font-heading text-label-sm text-foreground"
                }
              >
                {action.label}
              </span>
            </span>
            {action.variant !== "destructive" && (
              <ChevronLeft className="size-[18px] text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      <ComplaintSummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        complaintId={complaintId}
        complaintLabel={complaintLabel ?? complaintId}
      />

      <ConfirmDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title={isFinished ? "إعادة فتح الشكوى" : "إغلاق الشكوى"}
        description={
          isFinished
            ? "هل أنت متأكد من إعادة فتح هذه الشكوى؟ سيتم تحويل حالتها إلى قيد الفحص."
            : "هل أنت متأكد من إغلاق هذه الشكوى؟ سيتم تحويل حالتها إلى منتهية."
        }
        confirmLabel={
          caseStatusMutation.isPending
            ? isFinished
              ? "جارٍ الفتح..."
              : "جارٍ الإغلاق..."
            : isFinished
              ? "إعادة فتح"
              : "إغلاق"
        }
        cancelLabel="إلغاء"
        variant={isFinished ? "default" : "destructive"}
        loading={caseStatusMutation.isPending}
        onConfirm={() =>
          caseStatusMutation.mutate(isFinished ? "NOT_FINISHED" : "FINISHED", {
            onSuccess: () => {
              toast.success(isFinished ? "تم إعادة فتح الشكوى" : "تم إغلاق الشكوى");
              setCloseConfirmOpen(false);
            },
            onError: () => toast.error("تعذر تحديث حالة الشكوى"),
          })
        }
      />
    </div>
  );
}
