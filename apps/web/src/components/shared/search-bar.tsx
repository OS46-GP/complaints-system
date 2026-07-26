import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function SearchBar({ placeholder = "البحث في الشكاوى..." }: { placeholder?: string }) {
  return (
    <div className="relative w-full">
      <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="h-10 rounded-lg border-none bg-muted ps-9 pe-4"
      />
    </div>
  )
}
