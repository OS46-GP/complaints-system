import type { ComplaintItem } from "@/features/complaint-list/types";

const dotColors: Record<string, string> = {
  High: "bg-destructive",
  Medium: "bg-tertiary",
  Low: "bg-muted-foreground",
};

export function ComplaintPriority({ severity }: { severity: ComplaintItem["severity"] }) {
  const colorMap: Record<string, string> = {
    High: "text-destructive",
    Medium: "text-tertiary",
    Low: "text-muted-foreground",
  };

  return (
    <div className={`flex items-center gap-1.5 ${colorMap[severity]}`}>
      <div className={`size-2 rounded-full ${dotColors[severity]}`} />
      <span className="font-heading text-label-sm">{severity === "High" ? "عالية" : severity === "Medium" ? "متوسطة" : "منخفضة"}</span>
    </div>
  );
}
