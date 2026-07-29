import { useNavigate, useLocation } from "react-router";
import {
  ArrowUp,
  UserSearch,
  ListTree,
  Pencil,
  MessageSquareReply,
  Archive,
  XCircle,
  Printer,
  ChevronLeft,
} from "lucide-react";

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ComplaintQuickActionsProps {
  complaintId: string;
}

export function ComplaintQuickActions({ complaintId }: ComplaintQuickActionsProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const editPath = isAdmin
    ? `/admin/complaints/${complaintId}/edit`
    : `/user/complaints/${complaintId}/edit`;
  const responsePath = isAdmin
    ? `/admin/complaints/${complaintId}/response`
    : `/user/complaints/${complaintId}/response`;
  const archivePath = isAdmin
    ? `/admin/complaints/${complaintId}/archive`
    : `/user/complaints/${complaintId}/archive`;

  const actions: ActionItem[] = [
    { icon: <Pencil className="size-5" />, label: "تعديل الشكوى", onClick: () => navigate(editPath) },
    { icon: <MessageSquareReply className="size-5" />, label: "إضافة رد", onClick: () => navigate(responsePath) },
    { icon: <Archive className="size-5" />, label: "أرشفة", onClick: () => navigate(archivePath) },
    { icon: <ArrowUp className="size-5" />, label: "تصعيد الشكوى", onClick: () => console.log("Escalate", complaintId) },
    { icon: <UserSearch className="size-5" />, label: "إعادة تعيين وكيل", onClick: () => console.log("Reassign", complaintId) },
    { icon: <ListTree className="size-5" />, label: "تغيير التصنيف", onClick: () => console.log("Reclassify", complaintId) },
    { icon: <Printer className="size-5" />, label: "طباعة", onClick: () => window.print() },
    { icon: <XCircle className="size-5" />, label: "إغلاق الشكوى", onClick: () => console.log("Close", complaintId), variant: "destructive" },
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
    </div>
  );
}
