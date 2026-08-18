import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PATHS } from "@/router/paths";

export function SearchBar({
  placeholder = "البحث في الشكاوى...",
}: {
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (!query) return;
    const base = isAdmin ? PATHS.ADMIN.COMPLAINTS : PATHS.USER.COMPLAINTS;
    navigate(`${base}?search=${encodeURIComponent(query)}`);
    setValue("");
  };

  const handleClear = () => {
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 rounded-lg border-none bg-muted ps-9 pe-20"
      />
      {value && (
        <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center flex-row-reverse gap-1">
          <Button type="submit" size="xs">
            <span>بحث</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={handleClear}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </form>
  );
}
