import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  const [inputValue, setInputValue] = useState(search);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit(inputValue);
    }
  };

  return (
    <div className="flex gap-4 flex-col md:flex-row-reverse md:items-center md:justify-between">
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <input
          dir="auto"
          className="w-full h-9 pe-9 ps-3 bg-surface-container-lowest border border-input rounded-lg text-body-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-all"
          placeholder="بحث..."
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
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
