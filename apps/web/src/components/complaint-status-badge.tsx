import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/types/complaint.types";

const statusMap: Record<
  ComplaintStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "ghost"
      | "link";
  }
> = {
  "in-progress": { label: "قيد المعالجة", variant: "secondary" },
  resolved: { label: "تم الحل", variant: "default" },
  closed: { label: "مغلقة", variant: "outline" },
  review: { label: "قيد المراجعة", variant: "destructive" },
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const { label, variant } = statusMap[status];
  return (
    <Badge variant={variant} className="h-auto px-3 py-1 font-bold">
      {label}
    </Badge>
  );
}
