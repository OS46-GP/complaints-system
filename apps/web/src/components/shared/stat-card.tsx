import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string;
  trendIcon: LucideIcon;
  trendText: string;
  trendColor?: string;
}

export function StatCard({
  icon: Icon,
  iconColor = "text-primary",
  label,
  value,
  trendIcon: TrendIcon,
  trendText,
  trendColor = "text-primary",
}: StatCardProps) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-6">
      <Icon className={cn("size-7", iconColor)} />
      <p className="font-heading text-label-sm text-muted-foreground">{label}</p>
      <h3 className="font-heading text-display-lg text-foreground">{value}</h3>
      <div className={cn("flex items-center gap-1 text-[0.75rem]", trendColor)}>
        <TrendIcon className="size-3.5" />
        <span>{trendText}</span>
      </div>
    </div>
  );
}
