import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFormProps {
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  onSubmit: (value: string) => void;
}

export function SearchForm({
  defaultValue = "",
  placeholder = "بحث...",
  name = "search",
  minLength,
  required = true,
  className,
  inputClassName,
  onSubmit,
}: SearchFormProps) {
  const [error, setError] = useState<string | null>(null);

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (required && !trimmed) return "يرجى إدخال نص للبحث";
    if (minLength && trimmed.length < minLength)
      return `يجب أن يحتوي النص على ${minLength} أحرف على الأقل`;
    return null;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const raw = (data.get(name) as string) ?? "";
    const trimmed = raw.trim();
    const validationError = validate(raw);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-1">
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center gap-2 ${className ?? ""}`}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
        <Input
          dir="rtl"
          name={name}
          key={defaultValue}
          defaultValue={defaultValue}
          className={`ps-3 pe-9 ${error ? "border-destructive focus-visible:ring-destructive/20" : ""} ${inputClassName ?? ""}`}
          placeholder={placeholder}
          onChange={() => setError(null)}
          aria-invalid={!!error}
        />
        <Button type="submit" size="sm" variant="secondary">
          <Search className="size-4" />
        </Button>
      </form>
      {error && (
        <p className="text-destructive text-label-sm px-1">{error}</p>
      )}
    </div>
  );
}
