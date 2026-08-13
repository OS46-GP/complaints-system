import { FileType2 } from "lucide-react";

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
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-mono text-mono-data text-muted-foreground",
        className,
      )}
    >
      <FileType2 className="size-3" />
      {LETTER_TYPE_LABELS[type]}
    </Badge>
  );
}