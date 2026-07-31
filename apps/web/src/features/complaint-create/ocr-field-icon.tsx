import { ScanText } from "lucide-react";
import { cn } from "@/lib/utils";

interface OcrFieldIconProps {
  className?: string;
}

export function OcrFieldIcon({ className }: OcrFieldIconProps) {
  return (
    <span
      title="تمت التعبئة تلقائياً من خلال قراءة المستند (OCR)"
      aria-hidden
      className={cn(
        "pointer-events-none flex shrink-0 items-center justify-center text-primary",
        className,
      )}
    >
      <ScanText className="size-4" />
    </span>
  );
}
