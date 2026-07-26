import { Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintActionItem } from "@/types/complaint-details.types";

interface ComplaintTimelineProps {
  actions: ComplaintActionItem[];
  currentStatus?: string;
}

function TimelineDot({ variant }: { variant: "completed" | "active" | "pending" }) {
  return (
    <div
      className={cn(
        "size-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-card",
        variant === "completed" && "bg-primary text-primary-foreground",
        variant === "active" && "bg-surface-container-highest",
        variant === "pending" && "bg-secondary text-secondary-foreground",
      )}
    >
      {variant === "completed" && <Check className="size-4" />}
      {variant === "active" && <div className="size-3 rounded-full bg-primary" />}
      {variant === "pending" && <User className="size-4" />}
    </div>
  );
}

export function ComplaintTimeline({ actions, currentStatus }: ComplaintTimelineProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 h-full">
      <h3 className="font-heading text-headline-md text-primary flex items-center gap-2 mb-6">
        <User className="size-5" />
        سجل التفاعلات والتقدم
      </h3>

      <div className="relative">
        <div className="absolute right-4 top-0 bottom-0 w-[2px] bg-border/30" />

        <div className="space-y-6 relative">
          {actions.length === 0 && (
            <div className="text-muted-foreground font-body text-body-md text-center py-8">
              لا توجد تفاعلات بعد
            </div>
          )}

          {actions.map((action, idx) => {
            const isLast = idx === actions.length - 1;
            const variant =
              idx === 0 && currentStatus === "in-progress"
                ? "active"
                : "completed";

            return (
              <div key={action.id} className="flex gap-4 items-start">
                <TimelineDot variant={variant} />
                <div className="min-w-0">
                  <p className="font-body text-body-md text-foreground font-bold">
                    {action.action}
                  </p>
                  {action.notes && (
                    <p className="text-muted-foreground font-heading text-label-sm">
                      {action.notes}
                    </p>
                  )}
                  <span className="text-muted-foreground font-heading text-[11px] mt-1 block">
                    {action.actionDate || action.createdAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
