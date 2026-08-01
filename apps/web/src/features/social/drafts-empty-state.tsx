import { Inbox, RefreshCw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePoll } from "@/features/social/hooks";

export function DraftsEmptyState() {
  const pollMutation = usePoll();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Inbox className="size-12 text-muted-foreground/40" />
      <div>
        <p className="font-heading text-body-lg font-semibold text-foreground">
          لا توجد منشورات بانتظار المراجعة
        </p>
        <p className="text-body-sm text-muted-foreground mt-1">
          شغّل عملية مسح المنشورات لالتقاط المنشورات الجديدة من المجموعات المُراقبة
        </p>
      </div>
      <Button
        variant="outline"
        className="gap-2"
        disabled={pollMutation.isPending}
        onClick={() => pollMutation.mutate()}
      >
        {pollMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {pollMutation.isPending ? "جارٍ المسح..." : "مسح المنشورات الآن"}
      </Button>
    </div>
  );
}
