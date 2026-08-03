import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExportFormat } from "@/features/reporting/types";

interface ExportButtonsProps {
  onExport: (format: ExportFormat) => void;
  isExporting?: ExportFormat | null;
  disabled?: boolean;
  disabledHint?: string;
  size?: "sm" | "default" | "lg" | "icon" | "xs" | "icon-sm" | "icon-lg";
}

export function ExportButtons({
  onExport,
  isExporting,
  disabled,
  disabledHint = "التصدير غير متاح لهذا التقرير",
  size = "sm",
}: ExportButtonsProps) {
  const buttons = (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size={size}
        className="gap-2"
        disabled={disabled || isExporting === "pdf"}
        onClick={() => onExport("pdf")}
      >
        {isExporting === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size={size}
        className="gap-2"
        disabled={disabled || isExporting === "xlsx"}
        onClick={() => onExport("xlsx")}
      >
        {isExporting === "xlsx" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        Excel
      </Button>
    </div>
  );

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttons}</TooltipTrigger>
          <TooltipContent>{disabledHint}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttons;
}
