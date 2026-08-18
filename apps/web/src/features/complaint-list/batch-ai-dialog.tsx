import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useSummarizeBatch,
  useDraftSelectionReport,
} from "@/features/complaint-list/hooks";
import { Markdown } from "@/components/shared/markdown";

type Mode = "summary" | "report";

interface BatchAiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaintIds: string[];
  count: number;
  initialMode: Mode;
}

export function BatchAiDialog({
  open,
  onOpenChange,
  complaintIds,
  count,
  initialMode,
}: BatchAiDialogProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [generatedMode, setGeneratedMode] = useState<Mode | null>(null);
  const [copied, setCopied] = useState(false);

  const summarizeMutation = useSummarizeBatch(complaintIds);
  const reportMutation = useDraftSelectionReport(complaintIds);
  const activeMutation =
    mode === "summary" ? summarizeMutation : reportMutation;

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const run = () => {
    setGeneratedMode(mode);
    setCopied(false);
    activeMutation.mutate();
  };

  const draft = generatedMode === mode ? activeMutation.data?.draft : undefined;
  const isPending = generatedMode === mode && activeMutation.isPending;
  const isError = generatedMode === mode && activeMutation.isError;

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
            الذكاء الاصطناعي — {count.toLocaleString("ar-SA")} شكوى مختارة
          </DialogTitle>
          <DialogDescription>
            توليد ملخص موحد أو تقرير رسمي للشكاوى المختارة
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={mode === "summary" ? "default" : "outline"}
            onClick={() => setMode("summary")}
          >
            <Sparkles className="size-4" />
            ملخص موحد
          </Button>
          <Button
            size="sm"
            variant={mode === "report" ? "default" : "outline"}
            onClick={() => setMode("report")}
          >
            <FileText className="size-4" />
            تقرير رسمي
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/50 p-4 font-body text-body-md leading-7 text-foreground text-justify">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              جارٍ إنشاء المحتوى...
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
              <p>تعذر إنشاء المحتوى. حاول مرة أخرى.</p>
              <Button variant="outline" size="sm" onClick={run}>
                <RotateCcw className="size-4" />
                إعادة المحاولة
              </Button>
            </div>
          ) : draft ? (
            <Markdown>{draft}</Markdown>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              اختر نوع المحتوى ثم اضغط «إنشاء»
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
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "تم النسخ" : "نسخ النص"}
            </Button>
          )}
          <Button size="sm" onClick={run} disabled={isPending}>
            {draft ? "إعادة الإنشاء" : "إنشاء"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}