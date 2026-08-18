import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, FileText, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LetterTemplateTypeBadge } from "@/features/letter-templates/letter-template-type-badge";
import { LetterTemplateActionsDropdown } from "@/features/letter-templates/letter-template-actions-dropdown";
import { LetterPreviewDialog } from "@/features/letter-templates/letter-preview-dialog";
import { usePreviewLetterTemplate } from "@/features/letter-templates/hooks";
import { PATHS } from "@/router/paths";
import type { LetterTemplate } from "@/features/letter-templates/types";

interface LetterTemplateCardProps {
  template: LetterTemplate;
  onEdit: () => void;
}

export function LetterTemplateCard({ template, onEdit }: LetterTemplateCardProps) {
  const navigate = useNavigate();
  const previewMutation = usePreviewLetterTemplate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isPending = previewMutation.isPending;

  return (
    <>
      <Card
        className="group h-full p-4 md:p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
        onClick={() => navigate(PATHS.ADMIN.LETTER_TEMPLATE_EDIT(template.id))}
      >
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

      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            previewMutation.mutate(template.id, {
              onSuccess: (url) => url && setPreviewUrl(url),
            });
          }}
          disabled={isPending}
          className="gap-2"
        >
          <Eye className="size-4" />
          {isPending ? "جارٍ المعاينة..." : "معاينة"}
        </Button>
        <span onClick={(e) => e.stopPropagation()}>
          <LetterTemplateActionsDropdown template={template} onEdit={onEdit} />
        </span>
      </div>
      </Card>

      <LetterPreviewDialog
        open={!!previewUrl}
        onOpenChange={(open) => {
          if (!open) setPreviewUrl(null);
        }}
        url={previewUrl}
        title={`معاينة: ${template.name}`}
      />
    </>
  );
}