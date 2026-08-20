import {
  CASE_STATUS_LABELS,
  SEVERITY_LABELS,
  type ApiComplaint,
} from "@/features/complaint-list/types";
import { useLocation, useNavigate } from "react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PATHS } from "@/router/paths";
import { BulletList } from "@/components/shared/bullet-list";

interface ComplaintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: ApiComplaint | null;
}

function PreviewRow({
  label,
  value,
  items,
}: {
  label: string;
  value?: string;
  items?: string[];
}) {
  return (
    <div className="min-w-0">
      <span className="block font-heading text-label-sm text-muted-foreground mb-0.5">
        {label}
      </span>
      {items && items.length > 0 ? (
        <BulletList items={items} />
      ) : (
        <p className="font-body text-body-md text-foreground break-words">{value || "—"}</p>
      )}
    </div>
  );
}

export function ComplaintPreviewDialog({
  open,
  onOpenChange,
  complaint,
}: ComplaintPreviewDialogProps) {
  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <ComplaintPreviewContent complaint={complaint} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function ComplaintPreviewContent({
  complaint,
  onClose,
}: {
  complaint: ApiComplaint;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const detailPath = pathname.startsWith("/admin")
    ? PATHS.ADMIN.COMPLAINT_DETAIL(complaint.id)
    : PATHS.USER.COMPLAINT_DETAIL(complaint.id);

  const departmentNames =
    complaint.departments?.map((entry) => entry.department.name).filter(Boolean) ??
    [];
  const fullDepartments = [
    ...new Set(
      [...departmentNames, complaint.department?.name].filter(
        (name): name is string => Boolean(name),
      ),
    ),
  ];
  const statusLabel = complaint.caseStatus
    ? CASE_STATUS_LABELS[complaint.caseStatus].label
    : complaint.examinationStatus?.name ?? "—";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="leading-snug">تفاصيل الشكوى — للعرض فقط</DialogTitle>
        <DialogDescription className="font-heading text-foreground">
          #{complaint.complaintNumber}-{complaint.statementYear} — {complaint.subject}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <PreviewRow label="المواطن" value={complaint.citizen?.fullName ?? "—"} />
          <PreviewRow label="الرقم القومي" value={complaint.citizen?.nationalId ?? "—"} />
          <PreviewRow
            label="الجهات المعنية"
            items={fullDepartments}
            value={fullDepartments.length > 0 ? undefined : "—"}
          />
          <PreviewRow label="الفئة" value={complaint.complaintType?.name ?? "—"} />
          <PreviewRow
            label="درجة الخطورة"
            value={SEVERITY_LABELS[complaint.severity] ?? complaint.severity}
          />
          <PreviewRow label="الحالة" value={statusLabel} />
          <PreviewRow
            label="تاريخ الوصول"
            value={new Date(complaint.arrivalDate).toLocaleDateString("ar-SA")}
          />
        </div>

        {complaint.annotation && (
          <div className="rounded-lg bg-muted/50 p-4">
            <span className="block font-heading text-label-sm text-muted-foreground mb-1">
              وصف الشكوى
            </span>
            <p className="font-body text-body-md text-foreground break-words whitespace-pre-line">
              {complaint.annotation}
            </p>
          </div>
        )}
      </div>

      <DialogFooter showCloseButton={false} className="sm:justify-between">
        <Button
          onClick={() => {
            onClose();
            navigate(detailPath);
          }}
          className="gap-2"
        >
          <ExternalLink className="size-4" />
          عرض التفاصيل الكاملة
        </Button>
        <Button variant="outline" onClick={onClose}>
          إغلاق
        </Button>
      </DialogFooter>
    </>
  );
}