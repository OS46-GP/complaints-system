import type { Department } from "@/features/departments/types";
import { DepartmentActionsDropdown } from "@/features/departments/department-actions-dropdown";

interface DepartmentCardProps {
  department: Department;
  onEdit: () => void;
}

export function DepartmentCard({ department, onEdit }: DepartmentCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-[16px] text-foreground break-all">
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
