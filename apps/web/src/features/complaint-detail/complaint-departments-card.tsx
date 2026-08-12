import { Building2, MessageSquareReply, FileUp } from "lucide-react";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

interface ComplaintDepartmentsCardProps {
  complaint: ComplaintDetailsData;
}

export function ComplaintDepartmentsCard({ complaint }: ComplaintDepartmentsCardProps) {
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
            return (
              <li key={department.id} className="space-y-2">
                <div className="flex items-start gap-2 font-body text-body-md text-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {department.name}
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
                      <span>
                        {new Date(department.outgoingLetterDate).toLocaleDateString("ar-SA")}
                      </span>
                    )}
                    {department.responseDeadlineDays && (
                      <span>المهلة: {department.responseDeadlineDays} يوم</span>
                    )}
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
                        <span>
                          تاريخ الوارد:{" "}
                          {new Date(department.importDate).toLocaleDateString("ar-SA")}
                        </span>
                      )}
                      {department.examinationStatusName && (
                        <span>{department.examinationStatusName}</span>
                      )}
                      {department.responseDate && (
                        <span>
                          {new Date(department.responseDate).toLocaleDateString("ar-SA")}
                        </span>
                      )}
                    </div>
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
    </section>
  );
}