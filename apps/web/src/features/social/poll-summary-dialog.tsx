import { FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { PollSummary } from "@/features/social/types";

const severityColor: Record<string, string> = {
  High: "text-destructive",
  Medium: "text-tertiary",
  Low: "text-muted-foreground",
};

const severityLabel: Record<string, string> = {
  High: "عالية",
  Medium: "متوسطة",
  Low: "منخفضة",
};

interface PollSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: PollSummary | null;
  isPending?: boolean;
  title?: string;
  description?: string;
}

export function PollSummaryDialog({
  open,
  onOpenChange,
  summary,
  isPending,
  title = "ملخص المسح",
  description = "تقرير مختصر عن الشكاوى التي تم التقاطها من المسح الأخير",
}: PollSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            جارٍ إنشاء الملخص...
          </div>
        ) : summary && (summary.overview || summary.items.length > 0) ? (
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
            {summary.overview && (
              <p className="text-body-md text-foreground/90">{summary.overview}</p>
            )}

            {summary.items.length > 0 && (
              <ul className="flex flex-col gap-3">
                {summary.items.map((item, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-border bg-surface-container-lowest p-3"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {item.complaintType && (
                        <Badge variant="outline">{item.complaintType}</Badge>
                      )}
                      <span
                        className={
                          severityColor[item.severity] ?? "text-muted-foreground"
                        }
                      >
                        {severityLabel[item.severity] ?? item.severity}
                      </span>
                    </div>
                    {item.summary && (
                      <p className="text-body-sm text-foreground/90">
                        {item.summary}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="py-6 text-center text-body-sm text-muted-foreground">
            لا يوجد ملخص متاح لهذا المسح
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
