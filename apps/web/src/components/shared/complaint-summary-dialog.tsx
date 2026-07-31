import { useEffect } from "react";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSummarizeComplaint } from "@/features/complaint-list/hooks";

interface ComplaintSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaintId: string;
  complaintLabel: string;
}

export function ComplaintSummaryDialog({
  open,
  onOpenChange,
  complaintId,
  complaintLabel,
}: ComplaintSummaryDialogProps) {
  const summarizeMutation = useSummarizeComplaint(complaintId);

  useEffect(() => {
    if (open) {
      summarizeMutation.reset();
      summarizeMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, complaintId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            الملخص الذكي للشكوى {complaintLabel}
          </DialogTitle>
          <DialogDescription>
            ملخص موجز للشكوى تم إنشاؤه بواسطة الذكاء الاصطناعي
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/50 p-4 font-body text-body-md leading-7 text-foreground whitespace-pre-wrap text-justify">
          {summarizeMutation.isPending ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              جارٍ إنشاء الملخص...
            </div>
          ) : summarizeMutation.isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
              <p>تعذر إنشاء الملخص الذكي. حاول مرة أخرى.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => summarizeMutation.mutate()}
              >
                <RotateCcw className="size-4" />
                إعادة المحاولة
              </Button>
            </div>
          ) : (
            summarizeMutation.data?.draft
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
