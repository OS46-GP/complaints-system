import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  FileUp,
  History,
  MessageSquareReply,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssignmentStatusBadge } from "@/features/complaint-detail/assignment-status-badge";
import { ComplaintAssignmentDetailsDialog } from "@/features/complaint-detail/complaint-assignment-details-dialog";
import {
  computeLateDays,
  formatDate,
} from "@/features/complaint-detail/assignment-status";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

interface ComplaintDepartmentsCardProps {
  complaint: ComplaintDetailsData;
}

export function ComplaintDepartmentsCard({ complaint }: ComplaintDepartmentsCardProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  const selectedDepartment = selectedDepartmentId
    ? complaint.departments.find((department) => department.id === selectedDepartmentId)
    : null;
  const selectedDepartmentAssignments = selectedDepartmentId
    ? complaint.assignmentHistory.filter(
        (assignment) => assignment.departmentId === selectedDepartmentId,
      )
    : [];
  const selectedAssignment =
    selectedDepartmentAssignments[selectedDepartmentAssignments.length - 1] ?? null;

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg">
      <h3 className="font-heading text-title-sm md:text-title-md text-foreground mb-4 flex items-center gap-2">
        <Building2 className="size-5 text-primary" />
        الجهات المعنية
      </h3>
      {complaint.departments.length > 0 ? (
        <ul className="space-y-3">
          {complaint.departments.map((department) => {
            const hasResponse = !!department.responseText;
            const missedDeadline =
              department.assignmentStatus === "OVERDUE" ||
              department.assignmentStatus === "ENDED_WITHOUT_RESPONSE";
            const departmentUrgencies = complaint.urgencies.filter(
              (urgency) => urgency.departmentId === department.id,
            );
            const lastUrgency =
              departmentUrgencies[departmentUrgencies.length - 1] ?? null;
            return (
              <li key={department.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 font-body text-body-md text-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="flex items-center gap-2 flex-wrap">
                      {department.name}
                      <AssignmentStatusBadge status={department.assignmentStatus} />
                      {(() => {
                        const lateDays = computeLateDays(department);
                        return lateDays ? (
                          <Badge
                            variant="warning"
                            className="h-auto px-2 py-0.5 text-[0.625rem] font-semibold"
                          >
                            <AlertTriangle className="size-3" />
                            متأخر {lateDays} يوم
                          </Badge>
                        ) : null;
                      })()}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() =>
                      setSelectedDepartmentId(department.id)
                    }
                  >
                    <History className="size-3.5" />
                    السجل
                  </Button>
                </div>

                {(department.outgoingLetterNumber ||
                  department.outgoingLetterDate ||
                  department.responseDeadlineDays) && (
                  <div className="ms-4 flex items-center gap-1.5 text-label-sm text-muted-foreground font-heading">
                    <FileUp className="size-3.5" />
                    {department.outgoingLetterNumber && (
                      <span>رقم الصادر: {department.outgoingLetterNumber}</span>
                    )}
                    {department.outgoingLetterDate && (
                      <span>{formatDate(department.outgoingLetterDate)}</span>
                    )}
                    {department.responseDeadlineDays && (
                      <span>المهلة: {department.responseDeadlineDays} يوم</span>
                    )}
                  </div>
                )}

                {departmentUrgencies.length > 0 && lastUrgency && (
                  <div className="ms-4 flex items-center gap-1.5 text-label-sm text-warning font-heading">
                    <Zap className="size-3.5" />
                    <span>
                      استعجال ({departmentUrgencies.length}) — {formatDate(lastUrgency.outgoingLetterDate)}
                    </span>
                  </div>
                )}

                {hasResponse ? (
                  <div className="ms-4 rounded-lg border border-border bg-surface-container-low p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-label-sm text-primary font-heading">
                      <MessageSquareReply className="size-3.5" />
                      رد الجهة
                    </div>
                    <p className="font-body text-body-md text-foreground whitespace-pre-wrap break-words">
                      {department.responseText}
                    </p>
                    <div className="flex items-center gap-3 text-label-xs text-muted-foreground flex-wrap">
                      {department.responseNumber && (
                        <span>رقم الوارد: {department.responseNumber}</span>
                      )}
                      {department.importDate && (
                        <span>تاريخ الوارد: {formatDate(department.importDate)}</span>
                      )}
                      {department.examinationStatusName && (
                        <span>{department.examinationStatusName}</span>
                      )}
                      {department.responseDate && (
                        <span>{formatDate(department.responseDate)}</span>
                      )}
                    </div>
                  </div>
                ) : missedDeadline ? (
                  <div className="ms-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-body-sm text-destructive">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>انتهت المهلة دون رد</span>
                  </div>
                ) : (
                  <p className="ms-4 font-body text-body-sm text-muted-foreground">
                    لم يتم الرد بعد
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="font-body text-body-md text-muted-foreground">—</p>
      )}

      {selectedDepartment && selectedAssignment && (
        <ComplaintAssignmentDetailsDialog
          open={!!selectedDepartmentId}
          onOpenChange={(open) => {
            if (!open) setSelectedDepartmentId(null);
          }}
          displayId={complaint.displayId}
          assignment={selectedAssignment}
          departmentAssignments={selectedDepartmentAssignments}
        />
      )}
    </section>
  );
}