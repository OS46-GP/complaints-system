import { Eye, FileText, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LetterTemplateTypeBadge } from "@/features/letter-templates/letter-template-type-badge";
import { LetterTemplateActionsDropdown } from "@/features/letter-templates/letter-template-actions-dropdown";
import { usePreviewLetterTemplate } from "@/features/letter-templates/hooks";
import type { LetterTemplate } from "@/features/letter-templates/types";

interface LetterTemplateCardProps {
  template: LetterTemplate;
  onEdit: () => void;
}

export function LetterTemplateCard({ template, onEdit }: LetterTemplateCardProps) {
  const previewMutation = usePreviewLetterTemplate();
  const isPending = previewMutation.isPending;

  return (
    <Card className="group p-4 md:p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <LetterTemplateTypeBadge type={template.type} />
          {template.isDefault && (
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="size-3" />
              افتراضي
            </Badge>
          )}
        </div>
        <span className="text-muted-foreground text-label-sm font-mono text-mono-data">
          ترتيب: {template.sortOrder}
        </span>
      </div>

      <div className="flex items-start gap-2">
        <FileText className="size-5 text-primary mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
        <div className="min-w-0">
          <p className="font-heading text-body-lg font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
            {template.name}
          </p>
          {template.description && (
            <p className="text-label-sm text-muted-foreground mt-0.5 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => previewMutation.mutate(template.id)}
          disabled={isPending}
          className="gap-2"
        >
          <Eye className="size-4" />
          {isPending ? "جارٍ المعاينة..." : "معاينة"}
        </Button>
        <LetterTemplateActionsDropdown template={template} onEdit={onEdit} />
      </div>
    </Card>
  );
}