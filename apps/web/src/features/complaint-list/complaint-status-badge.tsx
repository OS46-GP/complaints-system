import { Badge } from "@/components/ui/badge";

interface ComplaintStatusBadgeProps {
  status: string | null;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}

export function ComplaintStatusBadge({ label, variant }: ComplaintStatusBadgeProps) {
  return (
    <Badge variant={variant} className="h-auto px-2 py-0.5 text-[10px] font-semibold">
      {label}
    </Badge>
  );
}
