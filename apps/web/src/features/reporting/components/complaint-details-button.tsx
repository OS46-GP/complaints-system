import { useState } from "react";
import { AlertCircle, Eye, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ComplaintPreviewContent } from "@/features/complaint-create/complaint-preview-dialog";
import { complaintsApi } from "@/features/complaint-list/api";
import type { ApiComplaint } from "@/features/complaint-list/types";
import { cn } from "@/lib/utils";

interface ComplaintDetailsButtonProps {
  complaintId: string;
  className?: string;
  buttonClassName?: string;
  label?: string;
}

export function ComplaintDetailsButton({
  complaintId,
  className,
  buttonClassName,
  label = "عرض التفاصيل",
}: ComplaintDetailsButtonProps) {
  const [open, setOpen] = useState(false);
  const [complaint, setComplaint] = useState<ApiComplaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadComplaint = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await complaintsApi.getById(complaintId);
      setComplaint(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setComplaint(null);
    setError(false);
    void loadComplaint();
  };

  const handleClose = () => {
    setOpen(false);
    setComplaint(null);
    setError(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className={cn("gap-1.5", buttonClassName)}
      >
        <Eye className="size-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={(next) => (next ? undefined : handleClose())}>
        <DialogContent className={cn("sm:max-w-lg", className)}>
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="font-body text-body-md text-muted-foreground">
                جارٍ تحميل تفاصيل الشكوى...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle className="size-8 text-destructive" />
              <p className="font-body text-body-md text-muted-foreground">
                تعذر تحميل تفاصيل الشكوى
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadComplaint()} className="gap-2">
                <RotateCcw className="size-4" />
                إعادة المحاولة
              </Button>
            </div>
          )}

          {!loading && !error && complaint && (
            <ComplaintPreviewContent
              complaint={complaint}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}