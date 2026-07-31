import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";
import { OcrFieldIcon } from "@/features/complaint-create/ocr-field-icon";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePresentationStatuses } from "@/features/complaint-list/hooks";

interface ComplaintDescriptionStepProps {
  ocrFields?: Set<string>;
}

export function ComplaintDescriptionStep({ ocrFields }: ComplaintDescriptionStepProps) {
  const form = useFormContext<ComplaintCreateFormValues>();
  const { data: presentationStatuses } = usePresentationStatuses();
  const isOcr = (field: string) => ocrFields?.has(field) ?? false;

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="annotation"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>
              وصف مفصل للشكوى <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="يرجى كتابة تفاصيل الشكوى بشكل كامل وواضح..."
                  rows={8}
                  className={cn("w-full resize-y text-base", isOcr("annotation") && "pe-10")}
                />
                {isOcr("annotation") && (
                  <OcrFieldIcon className="absolute end-3 top-3" />
                )}
              </div>
            </FormControl>
            <p className="text-label-sm text-muted-foreground text-left mt-1">
              اشرح الموقف، التواريخ، والأشخاص المعنيين إن وجدوا.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="presentationStatusId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>حالة التقديم</FormLabel>
            <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full data-[size=default]:h-11">
                  <SelectValue placeholder="اختر حالة التقديم" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {presentationStatuses?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
