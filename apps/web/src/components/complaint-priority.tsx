import type { ComplaintPriority } from "@/types/complaint.types";

const priorityConfig: Record<ComplaintPriority, { label: string; color: string }> = {
  high: { label: "عالية", color: "text-destructive" },
  medium: { label: "متوسطة", color: "text-tertiary" },
  low: { label: "منخفضة", color: "text-muted-foreground" },
};

const dotColors: Record<ComplaintPriority, string> = {
  high: "bg-destructive",
  medium: "bg-tertiary",
  low: "bg-muted-foreground",
};

export function ComplaintPriority({ priority }: { priority: ComplaintPriority }) {
  const config = priorityConfig[priority];
  return (
    <div className={`flex items-center gap-1.5 ${config.color}`}>
      <div className={`size-2 rounded-full ${dotColors[priority]}`} />
      <span className="font-heading text-label-sm">{config.label}</span>
    </div>
  );
}
