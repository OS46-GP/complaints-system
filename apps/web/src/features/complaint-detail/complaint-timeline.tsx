import { Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintActionItem } from "@/features/complaint-detail/types";

interface ComplaintTimelineProps {
  actions: ComplaintActionItem[];
  currentStatus?: string;
}

export function ComplaintTimeline({
  actions,
  currentStatus,
}: ComplaintTimelineProps) {
  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg h-full">
      <h2 className="font-heading text-title-sm md:text-title-md text-foreground mb-6">
        مسار الشكوى
      </h2>

      <div className="relative">
        {actions.length === 0 ? (
          <p className="text-body-sm text-muted-foreground text-center py-8">
            لا توجد إجراءات بعد
          </p>
        ) : (
          <ol className="space-y-0">
            {actions.map((action, index) => {
              const isLast = index === actions.length - 1;
              const isActive = isLast && currentStatus !== "closed";

              return (
                <li key={action.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Vertical line */}
                  {!isLast && (
                    <div className="absolute right-[11px] top-6 bottom-0 w-px bg-border" />
                  )}

                  {/* Dot */}
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "size-6 rounded-full flex items-center justify-center",
                        isActive
                          ? "bg-primary"
                          : "bg-surface-container-high"
                      )}
                    >
                      {isLast && currentStatus === "closed" ? (
                        <Check className="size-3.5 text-primary" />
                      ) : isActive ? (
                        <div className="size-2 rounded-full bg-white animate-pulse" />
                      ) : (
                        <div className="size-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-label-sm text-foreground">
                        {action.action}
                      </h3>
                      {isActive && (
                        <span className="text-label-xs text-primary font-heading">
                          جاري
                        </span>
                      )}
                    </div>
                    {action.notes && (
                      <p className="text-body-sm text-muted-foreground mb-1">
                        {action.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-label-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {action.createdAt}
                      </span>
                      <span>{action.actionDate}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
