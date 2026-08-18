import { useRef } from "react";
import { Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LetterPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  title?: string;
}

export function LetterPreviewDialog({
  open,
  onOpenChange,
  url,
  title,
}: LetterPreviewDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    if (!url) return;
    try {
      iframeRef.current?.contentWindow?.print();
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open && !!url} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title ?? "معاينة الخطاب"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-label-sm text-muted-foreground">
            اطّلع على الخطاب قبل الطباعة، ثم اضغط «طباعة» لبدء الطباعة.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              <X className="size-4" />
              إغلاق
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="size-4" />
              طباعة
            </Button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-border">
          {url && (
            <iframe
              ref={iframeRef}
              title="معاينة الخطاب"
              src={url}
              className="w-full h-[65vh] bg-white"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}