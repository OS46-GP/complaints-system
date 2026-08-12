import { Building2 } from "lucide-react";
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
        <ul className="space-y-2">
          {complaint.departments.map((department) => (
            <li
              key={department.id}
              className="flex items-start gap-2 font-body text-body-md text-foreground"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {department.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-body text-body-md text-muted-foreground">—</p>
      )}
    </section>
  );
}