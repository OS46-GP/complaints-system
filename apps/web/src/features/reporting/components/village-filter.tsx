import { MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocations } from "@/features/complaint-list/hooks";

interface VillageFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function VillageFilter({
  value,
  onChange,
  className,
  placeholder = "كل القرى",
}: VillageFilterProps) {
  const { data: locations, isLoading } = useLocations();

  const villages = Array.from(
    new Set((locations ?? []).map((item) => item.name).filter(Boolean)),
  ).sort();

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange(v === "all" ? "" : v)}
      disabled={isLoading}
    >
      <SelectTrigger className={className}>
        <MapPin className="size-4" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {villages.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}