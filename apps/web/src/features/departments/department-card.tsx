import type { Department } from "@/features/departments/types";
import { DepartmentActionsDropdown } from "@/features/departments/department-actions-dropdown";

interface DepartmentCardProps {
  department: Department;
  onEdit: () => void;
}

export function DepartmentCard({ department, onEdit }: DepartmentCardProps) {
  return (
    <div className="group bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-[1rem] text-foreground break-all transition-colors duration-300 group-hover:text-primary">
            {department.name}
          </h3>
          <p className="text-label-sm text-muted-foreground mt-1 break-all">
            {department.subAuthority || "—"}
          </p>
        </div>
        <DepartmentActionsDropdown
          departmentId={department.id}
          departmentName={department.name}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}
