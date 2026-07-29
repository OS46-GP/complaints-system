import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Archive } from "lucide-react";

import { getComplaintDetails } from "@/features/complaint-detail/api";
import { submitComplaintArchive } from "@/features/complaint-archive/api";
import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComplaintArchiveFormProps {
  complaintId: string;
}

export function ComplaintArchiveForm({ complaintId }: ComplaintArchiveFormProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const listPath = pathname.startsWith("/user") ? PATHS.USER.COMPLAINTS : PATHS.ADMIN.COMPLAINTS;

  const [archiveNumber, setArchiveNumber] = useState("");
  const [archiveDate, setArchiveDate] = useState("");
  const [archiveLocation, setArchiveLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => getComplaintDetails(complaintId),
    enabled: !!complaintId,
  });

  if (isLoading || !complaint) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isFormValid = archiveNumber.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await submitComplaintArchive(complaintId, {
        archiveNumber: archiveNumber.trim(),
        archiveDate: archiveDate || undefined,
        archiveLocation: archiveLocation.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      toast.success("تم أرشفة الشكوى بنجاح");
      navigate(listPath);
    } catch {
      toast.error("حدث خطأ أثناء أرشفة الشكوى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-6 md:mb-10 text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            أرشفة الشكوى
          </h1>
          <p className="font-body text-body-md md:text-body-lg text-muted-foreground">
            {complaint.displayId} — {complaint.subject}
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-border p-4 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col gap-2">
            <Label>رقم الحفظ <span className="text-destructive">*</span></Label>
            <Input
              value={archiveNumber}
              onChange={(e) => setArchiveNumber(e.target.value)}
              placeholder="رقم حفظ الأرشيف"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>تاريخ الأرشفة</Label>
              <Input
                type="date"
                value={archiveDate}
                onChange={(e) => setArchiveDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>موقع الحفظ</Label>
              <Input
                value={archiveLocation}
                onChange={(e) => setArchiveLocation(e.target.value)}
                placeholder="موقع الحفظ (اختياري)"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex flex-row-reverse justify-between items-center border-t border-border pt-6">
            <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid} className="gap-2">
              {isSubmitting ? "جارٍ الأرشفة..." : "أرشفة"}
              <Archive className="size-4" />
            </Button>
            <Button variant="ghost" onClick={() => navigate(listPath)} className="gap-2">
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
