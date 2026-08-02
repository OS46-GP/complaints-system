import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/shared/search-form";

interface UserListToolbarProps {
  search: string;
  onSearchSubmit: (value: string) => void;
  roleFilter: string | null;
  onRoleFilterChange: (role: string | null) => void;
}

const ROLE_FILTERS: { value: string | null; label: string }[] = [
  { value: null, label: "الكل" },
  { value: "Official", label: "موظف" },
  { value: "Admin", label: "مدير نظام" },
];

export function UserListToolbar({
  search,
  onSearchSubmit,
  roleFilter,
  onRoleFilterChange,
}: UserListToolbarProps) {
  return (
    <div className="flex gap-4 flex-col md:flex-row-reverse md:items-center md:justify-between">
      <SearchForm defaultValue={search} onSubmit={onSearchSubmit} />
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ROLE_FILTERS.map((f) => (
          <Button
            key={f.label}
            variant={roleFilter === f.value ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => onRoleFilterChange(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
