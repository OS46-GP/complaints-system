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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-headline-md text-primary flex items-center gap-2">
          <FileText className="size-5" />
          {subject}
        </h3>
        {onEdit && (
          <Button variant="link" size="sm" onClick={onEdit} className="text-primary">
            تعديل
          </Button>
        )}
      </div>
      <p className="text-muted-foreground font-body text-body-md leading-relaxed">
        {annotation || "لا يوجد وصف"}
      </p>
    </div>
  );
}
