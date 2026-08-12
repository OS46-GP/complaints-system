import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { Repeat, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

import { useComplaint } from "@/features/complaint-detail/hooks";
import { useDepartments } from "@/features/complaint-list/hooks";
import { useReassignComplaint } from "@/features/complaint-reassign/hooks";
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

interface ComplaintReassignFormProps {
  complaintId: string;
}

export function ComplaintReassignForm({ complaintId }: ComplaintReassignFormProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isUser = pathname.startsWith("/user");
  const detailPath = isUser
    ? PATHS.USER.COMPLAINT_DETAIL
    : PATHS.ADMIN.COMPLAINT_DETAIL;
  const reassignMutation = useReassignComplaint();

  const [departmentId, setDepartmentId] = useState("");
  const [outgoingLetterNumber, setOutgoingLetterNumber] = useState("");
  const [outgoingLetterDate, setOutgoingLetterDate] = useState("");
  const [responseDeadlineDays, setResponseDeadlineDays] = useState("");

  const { data: complaint, isLoading, isError, refetch } = useComplaint(complaintId);
  const { data: departments } = useDepartments();

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

  const assignedDepartmentIds = new Set(complaint.departments.map((department) => department.id));
  const respondedDepartmentIds = new Set(
    complaint.departments
      .filter((department) => department.responseText)
      .map((department) => department.id),
  );

  const selectedDepartmentId = departmentId || complaint.departments[0]?.id || "";
  const selectedDepartmentRecord = complaint.departments.find(
    (department) => department.id === selectedDepartmentId,
  );
  const selectedDepartment = departments?.find(
    (department) => department.id === selectedDepartmentId,
  );
  const isAssigned = assignedDepartmentIds.has(selectedDepartmentId);
  const isResponded = respondedDepartmentIds.has(selectedDepartmentId);

  useEffect(() => {
    if (!selectedDepartmentRecord) return;
    setOutgoingLetterNumber((previous) => previous || selectedDepartmentRecord.outgoingLetterNumber || "");
    setOutgoingLetterDate((previous) =>
      previous ||
      (selectedDepartmentRecord.outgoingLetterDate
        ? selectedDepartmentRecord.outgoingLetterDate.slice(0, 10)
        : ""),
    );
    setResponseDeadlineDays((previous) =>
      previous ||
      (selectedDepartmentRecord.responseDeadlineDays
        ? String(selectedDepartmentRecord.responseDeadlineDays)
        : ""),
    );
  }, [selectedDepartmentRecord]);

  const isFormValid =
    !!selectedDepartmentId &&
    outgoingLetterNumber.trim().length > 0 &&
    outgoingLetterDate.trim().length > 0 &&
    /^\d+$/.test(responseDeadlineDays) &&
    Number(responseDeadlineDays) >= 1;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      await reassignMutation.mutateAsync({
        id: complaintId,
        departmentId: selectedDepartmentId,
        payload: {
          outgoingLetterNumber: outgoingLetterNumber.trim(),
          outgoingLetterDate,
          responseDeadlineDays: Number(responseDeadlineDays),
        },
      });
      toast.success("تمت إعادة إحالة الشكوى بنجاح");
      navigate(detailPath(complaintId));
    } catch {
      toast.error("حدث خطأ أثناء إعادة الإحالة");
    }
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-6 md:mb-10 text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            إعادة إحالة الشكوى
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
                {departments?.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {departments?.length === 0 && (
              <p className="text-body-sm text-muted-foreground">لا توجد جهات معنية متاحة.</p>
            )}
          </div>

          {selectedDepartment && (
            <div className="rounded-lg border border-border bg-surface-container-low p-4 flex items-start gap-3">
              {isResponded ? (
                <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
              ) : isAssigned ? (
                <Info className="size-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-heading text-label-sm text-foreground font-bold">
                  {selectedDepartment.name}
                  {selectedDepartment.subAuthority
                    ? ` — ${selectedDepartment.subAuthority}`
                    : ""}
                </p>
                <p className="font-body text-body-sm text-muted-foreground">
                  {isResponded
                    ? "هذه الجهة سبق أن ردت على الشكوى. ستُعاد إحالة الشكوى إليها ويفتح باب الرد من جديد لديها."
                    : isAssigned
                      ? "هذه الجهة مرتبطة بالفعل بهذه الشكوى ولم ترد بعد."
                      : "سيتم إحالة الشكوى إلى هذه الجهة لأول مرة."}
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <p className="font-heading text-headline-md text-foreground mb-4">بيانات الصادر</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>رقم الصادر <span className="text-destructive">*</span></Label>
                <Input
                  value={outgoingLetterNumber}
                  onChange={(e) => setOutgoingLetterNumber(e.target.value)}
                  placeholder="رقم خطاب الصادر"
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>تاريخ الصادر <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={outgoingLetterDate}
                  onChange={(e) => setOutgoingLetterDate(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>مدة الرد (أيام) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min={1}
                  value={responseDeadlineDays}
                  onChange={(e) => setResponseDeadlineDays(e.target.value)}
                  placeholder="مثال: 30"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row-reverse justify-between items-center border-t border-border pt-6">
            <Button
              onClick={handleSubmit}
              disabled={reassignMutation.isPending || !isFormValid}
              className="gap-2"
            >
              {reassignMutation.isPending ? "جارٍ الإحالة..." : "إعادة الإحالة"}
              <Repeat className="size-4" />
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