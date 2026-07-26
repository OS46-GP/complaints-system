import { Printer } from "lucide-react";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";
import { ComplaintDescriptionCard } from "@/features/complaint-detail/complaint-description-card";
import { ComplaintEvidenceGallery } from "@/features/complaint-detail/complaint-evidence-gallery";
import { ComplaintTimeline } from "@/features/complaint-detail/complaint-timeline";
import { ComplaintMetaPanel } from "@/features/complaint-detail/complaint-meta-panel";
import { ComplaintQuickActions } from "@/features/complaint-detail/complaint-quick-actions";
import { Button } from "@/components/ui/button";

interface ComplaintDetailsViewProps {
  complaint: ComplaintDetailsData;
  onEditDescription?: () => void;
  onUploadFile?: () => void;
}

export function ComplaintDetailsView({
  complaint,
  onEditDescription,
  onUploadFile,
}: ComplaintDetailsViewProps) {
  return (
    <>
      <div className="mb-6 md:mb-10 flex items-center justify-between">
        <div className="text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            تفاصيل الشكوى
          </h1>
          <p className="font-body text-body-md md:text-body-lg text-muted-foreground">
            {complaint.complaintNumber}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-2"
        >
          <Printer className="size-4" />
          طباعة
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 max-w-[1600px] mx-auto">
      <div className="col-span-12 lg:col-span-5 space-y-4 md:space-y-6">
        <ComplaintDescriptionCard
          subject={complaint.subject}
          annotation={complaint.annotation}
          onEdit={onEditDescription}
        />
        <ComplaintEvidenceGallery
          files={complaint.files}
          onUpload={onUploadFile}
        />
      </div>

      <div className="col-span-12 lg:col-span-4">
        <ComplaintTimeline
          actions={complaint.actions}
          currentStatus={complaint.status}
        />
      </div>

      <div className="col-span-12 lg:col-span-3 space-y-4 md:space-y-6">
        <ComplaintMetaPanel complaint={complaint} />
        <ComplaintQuickActions complaintId={complaint.id} />
      </div>
    </div>
    </>
  );
}
