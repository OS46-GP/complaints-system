import { useState } from "react";
import { toast } from "sonner";
import { CalendarRange, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker, type DateRangeValue } from "@/features/reporting/components/date-range-picker";
import { useSummarizeByDate } from "@/features/social/hooks";
import { PollSummaryDialog } from "@/features/social/poll-summary-dialog";

export function DateSummaryCard() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const mutation = useSummarizeByDate();

  const canGenerate =
    !!dateRange.from &&
    !!dateRange.to &&
    dateRange.from <= dateRange.to &&
    !mutation.isPending;

  const handleGenerate = () => {
    if (!dateRange.from || !dateRange.to) return;
    mutation.mutate(
      { from: dateRange.from, to: dateRange.to },
      {
        onSuccess: () => setDialogOpen(true),
        onError: () =>
          toast.error("تعذر توليد الملخص، حاول مرة أخرى"),
      },
    );
  };

  return (
    <>
      <Card className="bg-surface-container-lowest">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-body-md">
            <CalendarRange className="size-5 text-primary" />
            ملخص الفترة
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CalendarRange className="size-4" />
            )}
            {mutation.isPending ? "جارٍ التوليد..." : "توليد ملخص الفترة"}
          </Button>
        </CardContent>
      </Card>

      <PollSummaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        summary={mutation.data?.summary ?? null}
        title="ملخص الفترة"
        description={`تقرير مختصر عن الشكاوى الملتقطة بين ${dateRange.from ?? "..."} و ${dateRange.to ?? "..."}`}
      />
    </>
  );
}
