import { Radio } from "lucide-react";

export function GroupsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Radio className="size-12 text-muted-foreground/40" />
      <div>
        <p className="font-heading text-body-lg font-semibold text-foreground">
          لا توجد مجموعات أو صفحات مراقبة
        </p>
        <p className="text-body-sm text-muted-foreground mt-1">
          أضف مجموعة أو صفحة فيسبوك لبدء تتبع المنشورات
        </p>
      </div>
    </div>
  );
}
