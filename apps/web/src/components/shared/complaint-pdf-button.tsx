import { Loader2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useGenerateComplaintPdf } from "@/features/complaint-list/hooks";
import { cn } from "@/lib/utils";

interface ComplaintPdfButtonProps {
  complaintId: string;
  label?: string;
  variant?: "button" | "menu-item";
  className?: string;
}

export function ComplaintPdfButton({
  complaintId,
  label = "طباعة PDF",
  variant = "button",
  className,
}: ComplaintPdfButtonProps) {
  const pdfMutation = useGenerateComplaintPdf();

  const icon = pdfMutation.isPending ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <Printer className="size-4" />
  );

  if (variant === "menu-item") {
    return (
      <DropdownMenuItem
        onClick={() => pdfMutation.mutate(complaintId)}
        disabled={pdfMutation.isPending}
        className={cn("w-full gap-2", className)}
      >
        {icon}
        {label}
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => pdfMutation.mutate(complaintId)}
      disabled={pdfMutation.isPending}
      className={cn("gap-2", className)}
    >
      {icon}
      {label}
    </Button>
  );
}
