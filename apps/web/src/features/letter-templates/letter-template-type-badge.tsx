import { FileText, FileType2, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LETTER_TYPE_LABELS } from "@/features/letter-templates/types";
import type { LetterTemplateType } from "@/features/letter-templates/types";

export function LetterTemplateTypeBadge({
  type,
  className,
}: {
  type: LetterTemplateType;
  className?: string;
}) {
  const icon =
    type === "HTML" ? (
      <FileType2 className="size-3" />
    ) : type === "DOCX" ? (
      <FileText className="size-3" />
    ) : (
      <Layers className="size-3" />
    );

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-mono text-mono-data text-muted-foreground",
        className,
      )}
    >
      {icon}
      {LETTER_TYPE_LABELS[type]}
    </Badge>
  );
}