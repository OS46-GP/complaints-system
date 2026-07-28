import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";

import { getComplaintDetails } from "@/features/complaint-detail/api";
import { submitComplaintResponse } from "@/features/complaint-response/api";
import { complaintsApi } from "@/features/complaint-list/api";
import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComplaintResponseFormProps {
  complaintId: string;
}

export function ComplaintResponseForm({ complaintId }: ComplaintResponseFormProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const listPath = pathname.startsWith("/user") ? PATHS.USER.COMPLAINTS : PATHS.ADMIN.COMPLAINTS;

  const [responseText, setResponseText] = useState("");
  const [responseDate, setResponseDate] = useState("");
  const [responseNumber, setResponseNumber] = useState("");
  const [examinationStatusId, setExaminationStatusId] = useState("");
  const [examinationResult, setExaminationResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => getComplaintDetails(complaintId),
    enabled: !!complaintId,
  });

  const { data: examinationStatuses } = useQuery({
    queryKey: ["examination-statuses"],
    queryFn: complaintsApi.getExaminationStatuses,
  });

  if (isLoading || !complaint) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isFormValid = responseText.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await submitComplaintResponse(complaintId, {
        authorityResponseText: responseText.trim(),
        authorityResponseDate: responseDate || undefined,
        incomingResponseNumber: responseNumber.trim() || undefined,
        examinationStatusId: examinationStatusId ? Number(examinationStatusId) : undefined,
        examinationResult: examinationResult.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      toast.success("تم إضافة الرد بنجاح");
      navigate(listPath);
    } catch {
      toast.error("حدث خطأ أثناء إضافة الرد");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-6 md:mb-10 text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            إضافة رد على الشكوى
          </h1>
          <p className="font-body text-body-md md:text-body-lg text-muted-foreground">
            {complaint.displayId} — {complaint.subject}
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-border p-4 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col gap-2">
            <Label>نص الرد <span className="text-destructive">*</span></Label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="اكتب رد الجهة المختصة على الشكوى..."
              rows={8}
              className="w-full rounded-lg border border-input bg-transparent p-4 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 placeholder:text-muted-foreground dark:bg-input/30 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>تاريخ الرد</Label>
              <Input
                type="date"
                value={responseDate}
                onChange={(e) => setResponseDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>رقم الرد الوارد</Label>
              <Input
                value={responseNumber}
                onChange={(e) => setResponseNumber(e.target.value)}
                placeholder="رقم الرد (اختياري)"
                className="h-11"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="font-heading text-headline-md text-foreground mb-4">حالة الفحص</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>حالة الفحص</Label>
                <select
                  value={examinationStatusId}
                  onChange={(e) => setExaminationStatusId(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
                >
                  <option value="">اختر حالة الفحص</option>
                  {examinationStatuses?.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>نتيجة الفحص</Label>
                <Input
                  value={examinationResult}
                  onChange={(e) => setExaminationResult(e.target.value)}
                  placeholder="نتيجة الفحص (اختياري)"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row-reverse justify-between items-center border-t border-border pt-6">
            <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid} className="gap-2">
              {isSubmitting ? "جارٍ الإرسال..." : "إضافة الرد"}
              <Send className="size-4" />
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
