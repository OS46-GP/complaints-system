import type { ComplaintCreateFormData } from "@/features/complaint-create/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePresentationStatuses } from "@/features/complaint-list/hooks";

interface ComplaintDescriptionStepProps {
  data: ComplaintCreateFormData;
  onChange: (partial: Partial<ComplaintCreateFormData>) => void;
  ocrFields?: Set<string>;
}

export function ComplaintDescriptionStep({ data, onChange, ocrFields }: ComplaintDescriptionStepProps) {
  const { data: presentationStatuses } = usePresentationStatuses();
  const isOcr = (field: string) => ocrFields?.has(field) ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label>وصف مفصل للشكوى</Label>
        <textarea
          value={data.annotation}
          onChange={(e) => onChange({ annotation: e.target.value })}
          placeholder="يرجى كتابة تفاصيل الشكوى بشكل كامل وواضح..."
          rows={8}
          className={`w-full rounded-lg border bg-transparent p-4 text-sm shadow-xs transition-colors focus-visible:ring-3 disabled:opacity-50 placeholder:text-muted-foreground dark:bg-input/30 resize-y ${
            isOcr("annotation")
              ? "border-success focus-visible:border-success focus-visible:ring-success/40"
              : "border-input focus-visible:border-ring focus-visible:ring-ring/50"
          }`}
        />
        <p className="text-label-sm text-muted-foreground text-left mt-1">
          اشرح الموقف، التواريخ، والأشخاص المعنيين إن وجدوا.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>حالة التقديم</Label>
        <Select
          dir="rtl"
          value={data.presentationStatusId || ""}
          onValueChange={(value) => onChange({ presentationStatusId: value })}
        >
          <SelectTrigger className="w-full data-[size=default]:h-11">
            <SelectValue placeholder="اختر حالة التقديم" />
          </SelectTrigger>
          <SelectContent>
            {presentationStatuses?.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
