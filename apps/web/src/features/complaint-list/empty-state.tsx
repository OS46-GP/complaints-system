import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}

export function EmptyState({ hasFilters, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <SearchX className="size-12 text-muted-foreground/40" />
      <div>
        <p className="font-heading text-body-lg font-semibold text-foreground">
          {hasFilters ? "لا توجد نتائج" : "لا يوجد شكاوى"}
        </p>
        <p className="text-body-sm text-muted-foreground mt-1">
          {hasFilters
            ? "لم يتم العثور على شكاوى تطابق معايير البحث المحددة"
            : "لم يتم إضافة أي شكاوى بعد"}
        </p>
      </div>
      {hasFilters && (
        <Button variant="outline" onClick={onClear}>
          إزالة الفلترة
        </Button>
      )}
    </div>
  );
}
