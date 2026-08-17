import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MemoSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  searching: boolean;
}

export function MemoSearchBar({
  value,
  onChange,
  onSubmit,
  searching,
}: MemoSearchBarProps) {
  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(value);
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="ابحث باسم المواطن أو رقم الشكوى..."
              className="ps-9"
            />
          </div>
          <Button
            type="submit"
            className="gap-2"
            disabled={searching || !value.trim()}
          >
            {searching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            بحث
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}