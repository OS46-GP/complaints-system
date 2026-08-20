import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { Send, AlertTriangle } from "lucide-react";

import { useComplaint } from "@/features/complaint-detail/hooks";
import { useSubmitComplaintResponse } from "@/features/complaint-response/hooks";
import { useExaminationStatuses } from "@/features/complaint-list/hooks";
import { AsyncLoader } from "@/components/shared/async-loader";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComplaintResponseFormProps {
  complaintId: string;
}

export function ComplaintResponseForm({ complaintId }: ComplaintResponseFormProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isUser = pathname.startsWith("/user");
  const detailPath = isUser
    ? PATHS.USER.COMPLAINT_DETAIL
    : PATHS.ADMIN.COMPLAINT_DETAIL;
  const responseMutation = useSubmitComplaintResponse();

  const [responseText, setResponseText] = useState("");
  const [responseDate, setResponseDate] = useState("");
  const [responseNumber, setResponseNumber] = useState("");
  const [examinationStatusId, setExaminationStatusId] = useState("");
  const [examinationResult, setExaminationResult] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const { data: complaint, isLoading, isError, refetch } = useComplaint(complaintId);
  const { data: examinationStatuses } = useExaminationStatuses();

  const openDepartments = useMemo(() => {
    const latest = new Map<string, { id: string; name: string; index: number }>();
    for (const assignment of complaint?.assignmentHistory ?? []) {
      if (assignment.status !== "ACTIVE") continue;
      const existing = latest.get(assignment.departmentId);
      if (!existing || assignment.assignmentIndex > existing.index) {
        latest.set(assignment.departmentId, {
          id: assignment.departmentId,
          name: assignment.departmentName,
          index: assignment.assignmentIndex,
        });
      }
    }
    return [...latest.values()];
  }, [complaint]);

  const selectedDepartmentId = departmentId || openDepartments[0]?.id || "";

  if (!complaint) {
    return (
      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل بيانات الشكوى"
        skeleton={<FormSkeleton />}
      />
    );
  }

  const isFormValid =
    responseText.trim().length > 0 &&
    responseDate.trim().length > 0 &&
    responseNumber.trim().length > 0 &&
    !!selectedDepartmentId;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      await responseMutation.mutateAsync({
        id: complaintId,
        departmentId: selectedDepartmentId,
        payload: {
          responseText: responseText.trim(),
          responseDate,
          responseNumber: responseNumber.trim(),
          importDate: responseDate || undefined,
          examinationStatusId: examinationStatusId ? Number(examinationStatusId) : undefined,
          examinationResult: examinationResult.trim() || undefined,
        },
      });
      toast.success("تم إضافة الرد بنجاح");
      navigate(detailPath(complaintId));
    } catch {
      toast.error("حدث خطأ أثناء إضافة الرد");
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
            <Label>الجهة المعنية <span className="text-destructive">*</span></Label>
            <Select dir="rtl" value={selectedDepartmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-full data-[size=default]:h-11">
                <SelectValue placeholder="اختر الجهة المعنية" />
              </SelectTrigger>
              <SelectContent>
                {openDepartments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {openDepartments.length === 0 ? (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-body-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  لا توجد جهات معنية بإحالات مفتوحة قبل انتهاء مهلة الرد. لا يمكن إضافة رد
                  لإحالة متأخرة أو منتهية.
                </span>
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground">
                يمكن إضافة الرد فقط للجهات التي لم تنتهِ مهلة الرد على إحالاتها بعد.
              </p>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <p className="font-heading text-headline-md text-foreground mb-4">بيانات الوارد (الرد)</p>
            <div className="flex flex-col gap-2 mb-4">
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
                <Label>تاريخ الرد <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={responseDate}
                  onChange={(e) => setResponseDate(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>رقم الرد الوارد <span className="text-destructive">*</span></Label>
                <Input
                  value={responseNumber}
                  onChange={(e) => setResponseNumber(e.target.value)}
                  placeholder="رقم الرد الوارد"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="font-heading text-headline-md text-foreground mb-4">حالة الفحص</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>حالة الفحص</Label>
                <Select
                  dir="rtl"
                  value={examinationStatusId || ""}
                  onValueChange={setExaminationStatusId}
                >
                  <SelectTrigger className="w-full data-[size=default]:h-11">
                    <SelectValue placeholder="اختر حالة الفحص" />
                  </SelectTrigger>
                  <SelectContent>
                    {examinationStatuses?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button onClick={handleSubmit} disabled={responseMutation.isPending || !isFormValid} className="gap-2">
              {responseMutation.isPending ? "جارٍ الإرسال..." : "إضافة الرد"}
              <Send className="size-4" />
            </Button>
            <Button variant="ghost" onClick={() => navigate(detailPath(complaintId))} className="gap-2">
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}