import { Building2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/features/complaint-list/hooks";

interface DepartmentFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function DepartmentFilter({
  value,
  onChange,
  className,
  placeholder = "كل الجهات",
}: DepartmentFilterProps) {
  const { data: departments, isLoading } = useDepartments();

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange(v === "all" ? "" : v)}
      disabled={isLoading}
    >
      <SelectTrigger className={className}>
        <Building2 className="size-4" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {(departments ?? []).map((dept) => (
          <SelectItem key={dept.id} value={dept.name}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
