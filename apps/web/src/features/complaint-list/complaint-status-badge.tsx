import { Badge } from "@/components/ui/badge";

interface ComplaintStatusBadgeProps {
  status: string | null;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}

export function ComplaintStatusBadge({ label, variant }: ComplaintStatusBadgeProps) {
  return (
    <Badge variant={variant} className="h-auto px-3 py-1 font-bold">
      {label}
    </Badge>
  );
}
