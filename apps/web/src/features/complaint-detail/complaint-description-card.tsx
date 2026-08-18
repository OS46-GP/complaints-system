import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComplaintDescriptionCardProps {
  subject: string;
  annotation: string;
  onEdit?: () => void;
}

export function ComplaintDescriptionCard({
  subject,
  annotation,
  onEdit,
}: ComplaintDescriptionCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-heading text-headline-md text-primary flex items-center gap-2 flex-1 min-w-0 break-words">
          <FileText className="size-5 shrink-0" />
          {subject}
        </h3>
        {onEdit && (
          <Button variant="link" size="sm" onClick={onEdit} className="text-primary shrink-0">
            تعديل
          </Button>
        )}
      </div>
      <p className="text-muted-foreground font-body text-body-md leading-relaxed whitespace-pre-wrap break-words">
        {annotation || "لا يوجد وصف"}
      </p>
    </div>
  );
}
