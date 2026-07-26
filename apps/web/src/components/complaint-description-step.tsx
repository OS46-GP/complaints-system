import type { ComplaintCreateFormData } from "@/types/complaint-create.types";
import { Label } from "@/components/ui/label";

const PRESENTATION_STATUSES = [
  { value: "1", label: "قيد الدراسة" },
  { value: "2", label: "تم التقديم" },
  { value: "3", label: "تحت الإجراء" },
  { value: "4", label: "مؤجل" },
];

interface ComplaintDescriptionStepProps {
  data: ComplaintCreateFormData;
  onChange: (partial: Partial<ComplaintCreateFormData>) => void;
}

export function ComplaintDescriptionStep({ data, onChange }: ComplaintDescriptionStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label>وصف مفصل للشكوى</Label>
        <textarea
          value={data.annotation}
          onChange={(e) => onChange({ annotation: e.target.value })}
          placeholder="يرجى كتابة تفاصيل الشكوى بشكل كامل وواضح..."
          rows={8}
          className="w-full rounded-lg border border-input bg-transparent p-4 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 placeholder:text-muted-foreground dark:bg-input/30 resize-y"
        />
        <p className="text-label-sm text-muted-foreground text-left mt-1">
          اشرح الموقف، التواريخ، والأشخاص المعنيين إن وجدوا.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>حالة التقديم</Label>
        <select
          value={data.presentationStatusId}
          onChange={(e) => onChange({ presentationStatusId: e.target.value })}
          className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
        >
          <option value="">اختر حالة التقديم</option>
          {PRESENTATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
