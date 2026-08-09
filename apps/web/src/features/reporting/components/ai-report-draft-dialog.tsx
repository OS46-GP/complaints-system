import { useEffect, useState } from "react";
import { Check, Copy, Loader2, RotateCcw, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/shared/markdown";
import { useAiDraftPeriodReport } from "@/features/reporting/hooks";

function formatPeriodLabel(from: string, to: string): string {
  return `${new Date(from).toLocaleDateString("ar-EG")} — ${new Date(to).toLocaleDateString("ar-EG")}`;
}

interface AiReportDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: string;
  to: string;
}

export function AiReportDraftDialog({
  open,
  onOpenChange,
  from,
  to,
}: AiReportDraftDialogProps) {
  const [copied, setCopied] = useState(false);
  const draftMutation = useAiDraftPeriodReport();

  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  const run = () => {
    setCopied(false);
    draftMutation.mutate({ from, to });
  };

  const draft = draftMutation.data?.draft;
  const isPending = draftMutation.isPending;
  const isError = draftMutation.isError;

  const copyDraft = async () => {
    if (!draft) return;
    await navigator.clipboard?.writeText(draft);
    setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            مسودة تقرير بالذكاء الاصطناعي
          </DialogTitle>
          <DialogDescription>
            صياغة مسودة تقرير دوري عن الفترة: {formatPeriodLabel(from, to)}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/50 p-4 font-body text-body-md leading-7 text-foreground text-justify">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              جارٍ صياغة المسودة من بيانات الشكاوى...
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
              <p>تعذر صياغة المسودة. حاول مرة أخرى.</p>
              <Button variant="outline" size="sm" onClick={run}>
                <RotateCcw className="size-4" />
                إعادة المحاولة
              </Button>
            </div>
          ) : draft ? (
            <Markdown>{draft}</Markdown>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              اضغط «صياغة المسودة» لإنشاء تقرير أولي عن الفترة المحددة — تُراجع
              المسودة وتُعتمد يدويًا قبل اعتمادها.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {draft && !isPending && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={copyDraft}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "تم النسخ" : "نسخ النص"}
            </Button>
          )}
          <Button size="sm" onClick={run} disabled={isPending}>
            {draft ? "إعادة الصياغة" : "صياغة المسودة"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}