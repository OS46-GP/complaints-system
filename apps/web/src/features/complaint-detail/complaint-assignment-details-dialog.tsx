import { useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarClock,
  FileText,
  History,
  Inbox,
  MessageSquareReply,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssignmentStatusBadge } from "@/features/complaint-detail/assignment-status-badge";
import {
  computeDueDate,
  formatDate,
} from "@/features/complaint-detail/assignment-status";
import type { DepartmentAssignment } from "@/features/complaint-detail/types";

interface ComplaintAssignmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayId: string;
  assignment: DepartmentAssignment;
  departmentAssignments?: DepartmentAssignment[];
  initialAssignmentId?: string;
}

function DetailRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-label-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn(
          "text-end break-words min-w-0",
          emphasis ? "font-heading text-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <p className="font-heading text-headline-sm text-foreground flex items-center gap-2 mb-3">
      {icon}
      {children}
    </p>
  );
}

export function ComplaintAssignmentDetailsDialog({
  open,
  onOpenChange,
  displayId,
  assignment,
  departmentAssignments,
  initialAssignmentId,
}: ComplaintAssignmentDetailsDialogProps) {
  const list = useMemo(() => {
    const items =
      departmentAssignments && departmentAssignments.length > 0
        ? departmentAssignments
        : [assignment];
    return [...items].sort((a, b) => a.assignmentIndex - b.assignmentIndex);
  }, [assignment, departmentAssignments]);

  const [selectedId, setSelectedId] = useState(initialAssignmentId ?? assignment.id);

  const selected = list.find((item) => item.id === selectedId) ?? list[list.length - 1];
  const hasResponse = !!selected.responseText || !!selected.respondedAt;
  const dueDate = computeDueDate(selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <Building2 className="size-5 text-primary" />
            {selected.departmentName}
            <span className="text-muted-foreground font-normal text-sm">{displayId}</span>
          </DialogTitle>
        </DialogHeader>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <AssignmentStatusBadge status={selected.status} />
            <span className="text-label-sm text-muted-foreground">
              الإحالة رقم {selected.assignmentIndex} — {formatDate(selected.createdAt)}
            </span>
          </div>

          {list.length > 1 && (
            <div className="mb-5">
              <p className="font-heading text-label-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <History className="size-3.5" />
                سجل إحالات الجهة
              </p>
              <div className="flex flex-wrap gap-2">
                {list.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-label-xs font-heading transition-colors",
                      item.id === selected.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-surface-container-low",
                    )}
                  >
                    الإحالة #{item.assignmentIndex}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <SectionTitle icon={<FileText className="size-4 text-primary" />}>
              بيانات الإحالة
            </SectionTitle>
            <div className="space-y-2 rounded-lg border border-border bg-surface-container-low p-3">
              <DetailRow label="رقم خطاب الصادر" value={selected.outgoingLetterNumber || "—"} />
              <DetailRow
                label="تاريخ الصادر"
                value={formatDate(selected.outgoingLetterDate)}
              />
              <DetailRow
                label="مدة الرد"
                value={
                  selected.responseDeadlineDays
                    ? `${selected.responseDeadlineDays} يوم`
                    : "—"
                }
              />
              <DetailRow
                label="تاريخ الاستحقاق"
                value={dueDate ? formatDate(dueDate.toISOString()) : "—"}
                emphasis
              />
              <DetailRow label="تاريخ الإحالة" value={formatDate(selected.createdAt)} />
              <DetailRow
                label="تاريخ الانتهاء"
                value={
                  selected.endedAt
                    ? formatDate(selected.endedAt)
                    : "لا تزال مفتوحة"
                }
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-6">
            <SectionTitle icon={<MessageSquareReply className="size-4 text-primary" />}>
              الرد على الإحالة
            </SectionTitle>
            {hasResponse ? (
              <div className="space-y-3 rounded-lg border border-border bg-surface-container-low p-3">
                <p className="whitespace-pre-wrap break-words text-body-md text-foreground">
                  {selected.responseText}
                </p>
                <div className="space-y-2 border-t border-border pt-3">
                  <DetailRow label="رقم الرد" value={selected.responseNumber || "—"} />
                  <DetailRow label="تاريخ الرد" value={formatDate(selected.responseDate)} />
                  <DetailRow label="تاريخ الوارد" value={formatDate(selected.importDate)} />
                  <DetailRow
                    label="حالة الفحص"
                    value={selected.examinationStatusName || "—"}
                  />
                  <DetailRow
                    label="نتيجة الفحص"
                    value={selected.examinationResult || "—"}
                  />
                  <DetailRow
                    label="تاريخ تسجيل الرد"
                    value={formatDate(selected.respondedAt)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-container-low p-3 text-body-sm text-muted-foreground">
                <Inbox className="size-4 shrink-0 mt-0.5" />
                لم يتم الرد على هذه الإحالة.
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 mt-6 flex items-center gap-2 text-label-xs text-muted-foreground">
            <CalendarClock className="size-3.5" />
            <span>
              {selected.endedAt
                ? `انتهت الإحالة بتاريخ ${formatDate(selected.endedAt)}`
                : "هذه الإحالة ما تزال مفعلة"}
            </span>
            {!hasResponse && !selected.endedAt && (
              <span className="flex items-center gap-1 text-warning">
                <Send className="size-3.5" />
                بانتظار الرد
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}