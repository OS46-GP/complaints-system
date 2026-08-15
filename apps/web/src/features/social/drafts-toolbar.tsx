import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePoll } from "@/features/social/hooks";
import { PollSummaryDialog } from "@/features/social/poll-summary-dialog";
import type { SocialDraftStatus } from "@/features/social/types";

interface DraftsToolbarProps {
  status: SocialDraftStatus | "";
  onStatusChange: (status: SocialDraftStatus | "") => void;
  showPoll?: boolean;
}

export function DraftsToolbar({ status, onStatusChange, showPoll = true }: DraftsToolbarProps) {
  const pollMutation = usePoll();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handlePoll = () => {
    pollMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result.draftsCreated.length > 0) {
          toast.success(`تم التقاط ${result.draftsCreated.length} منشور جديد`);
          if (result.summary) setSummaryOpen(true);
        } else if (result.aiFiltered > 0 || result.spamSkipped > 0) {
          toast.info("لا توجد منشورات جديدة (تم استبعاد الإعلانات والمحتوى غير ذي الصلة)");
        } else {
          toast.info("لا توجد منشورات جديدة");
        }
      },
      onError: () => toast.error("تعذر مسح المنشورات"),
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as SocialDraftStatus | "")}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="كل الحالات" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">كل الحالات</SelectItem>
          <SelectItem value="Pending">بانتظار المراجعة</SelectItem>
          <SelectItem value="Approved">مُعتمدة</SelectItem>
          <SelectItem value="Rejected">مرفوضة</SelectItem>
        </SelectContent>
      </Select>

      {showPoll && (
        <Button
          className="gap-2"
          disabled={pollMutation.isPending}
          onClick={handlePoll}
        >
          {pollMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Radar className="size-4" />
          )}
          {pollMutation.isPending ? "جارٍ المسح..." : "مسح المنشورات الآن"}
        </Button>
      )}

      <PollSummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        summary={pollMutation.data?.summary ?? null}
      />
    </div>
  );
}
