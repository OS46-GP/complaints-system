import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { Zap, Info, AlertTriangle } from "lucide-react";

import { useComplaint } from "@/features/complaint-detail/hooks";
import { useDepartments } from "@/features/complaint-list/hooks";
import { useSendUrgency } from "@/features/complaint-urgency/hooks";
import { AssignmentStatusBadge } from "@/features/complaint-detail/assignment-status-badge";
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
import type { DepartmentAssignment } from "@/features/complaint-detail/types";

interface ComplaintUrgencyFormProps {
  complaintId: string;
}

export function ComplaintUrgencyForm({ complaintId }: ComplaintUrgencyFormProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isUser = pathname.startsWith("/user");
  const detailPath = isUser
    ? PATHS.USER.COMPLAINT_DETAIL
    : PATHS.ADMIN.COMPLAINT_DETAIL;
  const urgencyMutation = useSendUrgency();

  const [departmentId, setDepartmentId] = useState("");
  const [outgoingLetterNumber, setOutgoingLetterNumber] = useState("");
  const [outgoingLetterDate, setOutgoingLetterDate] = useState("");

  const { data: complaint, isLoading, isError, refetch } = useComplaint(complaintId);
  const { data: departments } = useDepartments();

  const eligibleDepartments = useMemo(() => {
    const latest = new Map<string, DepartmentAssignment>();
    for (const assignment of complaint?.assignmentHistory ?? []) {
      if (assignment.status !== "OVERDUE") continue;
      const existing = latest.get(assignment.departmentId);
      if (!existing || assignment.assignmentIndex > existing.assignmentIndex) {
        latest.set(assignment.departmentId, assignment);
      }
    }
    return [...latest.values()];
  }, [complaint]);

  const selectedDepartmentId = departmentId || eligibleDepartments[0]?.id || "";

  const selectedAssignment = useMemo(
    () =>
      eligibleDepartments.find(
        (assignment) => assignment.departmentId === selectedDepartmentId,
      ) ?? null,
    [eligibleDepartments, selectedDepartmentId],
  );

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

  const selectedDepartment = departments?.find(
    (department) => department.id === selectedDepartmentId,
  );

  const isFormValid =
    !!selectedDepartmentId &&
    outgoingLetterNumber.trim().length > 0 &&
    outgoingLetterDate.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      await urgencyMutation.mutateAsync({
        id: complaintId,
        departmentId: selectedDepartmentId,
        payload: {
          outgoingLetterNumber: outgoingLetterNumber.trim(),
          outgoingLetterDate,
        },
      });
      toast.success("تم إرسال الاستعجال بنجاح");
      navigate(detailPath(complaintId));
    } catch {
      toast.error("حدث خطأ أثناء إرسال الاستعجال");
    }
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-6 md:mb-10 text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            إرسال استعجال
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
                {eligibleDepartments.map((assignment) => (
                  <SelectItem key={assignment.departmentId} value={assignment.departmentId}>
                    {assignment.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {eligibleDepartments.length === 0 ? (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-body-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  لا توجد جهات معنية انتهت مهلة الرد عليها دون رد حتى الآن. لا يمكن إرسال
                  استعجال لجهة لم تنتهِ مهلة ردها بعد.
                </span>
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground">
                يمكن إرسال الاستعجال فقط للجهات التي انتهت مهلة الرد على إحالاتها دون رد.
              </p>
            )}
          </div>

          {selectedAssignment && (
            <div className="rounded-lg border border-border bg-surface-container-low p-4 flex items-start gap-3">
              <Info className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-heading text-label-sm text-foreground font-bold">
                  {selectedDepartment?.name ?? selectedAssignment.departmentName}
                  {selectedDepartment?.subAuthority
                    ? ` — ${selectedDepartment.subAuthority}`
                    : ""}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <AssignmentStatusBadge status="OVERDUE" />
                  <span className="text-label-xs text-muted-foreground">
                    الإحالة رقم {selectedAssignment.assignmentIndex} — انتهت المهلة دون رد
                  </span>
                </div>
                <p className="font-body text-body-sm text-muted-foreground">
                  سيتم توجيه استعجال لهذه الجهة بسبب تجاوزها مهلة الرد على الإحالة المفتوحة
                  الحالية.
                </p>
              </div>
            </div>
          )}

          {eligibleDepartments.length > 0 && (
            <>
              <div className="border-t border-border pt-6">
                <p className="font-heading text-headline-md text-foreground mb-4">بيانات الاستعجال</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>رقم الصادر <span className="text-destructive">*</span></Label>
                    <Input
                      value={outgoingLetterNumber}
                      onChange={(e) => setOutgoingLetterNumber(e.target.value)}
                      placeholder="رقم خطاب الاستعجال الصادر"
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
                </div>
              </div>

              <div className="flex flex-row-reverse justify-between items-center border-t border-border pt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={urgencyMutation.isPending || !isFormValid}
                  className="gap-2"
                >
                  {urgencyMutation.isPending ? "جارٍ الإرسال..." : "إرسال الاستعجال"}
                  <Zap className="size-4" />
                </Button>
                <Button variant="ghost" onClick={() => navigate(detailPath(complaintId))} className="gap-2">
                  إلغاء
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}