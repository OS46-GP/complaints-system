import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";
import { OcrFieldIcon } from "@/features/complaint-create/ocr-field-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  useComplaintTypes,
  useDepartments,
  useReceptionMethods,
} from "@/features/complaint-list/hooks";

interface ComplaintBasicInfoStepProps {
  ocrFields?: Set<string>;
}

export function ComplaintBasicInfoStep({ ocrFields }: ComplaintBasicInfoStepProps) {
  const form = useFormContext<ComplaintCreateFormValues>();
  const isOcr = (field: string) => ocrFields?.has(field) ?? false;
  const { data: departments } = useDepartments();
  const { data: complaintTypes } = useComplaintTypes();
  const { data: receptionMethods } = useReceptionMethods();
  const departmentIds = form.watch("departmentIds");
  const availableDepartments = (departments ?? []).filter(
    (department) => !departmentIds.includes(department.id),
  );

  const departmentsForRow = (index: number) =>
    (departments ?? []).filter(
      (department) =>
        !departmentIds.some(
          (id, rowIndex) => rowIndex !== index && id === department.id,
        ),
    );

  const setDepartmentId = (index: number, value: string) => {
    const next = [...departmentIds];
    next[index] = value;
    form.setValue("departmentIds", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeDepartment = (index: number) => {
    form.setValue(
      "departmentIds",
      departmentIds.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const addDepartment = () => {
    form.setValue("departmentIds", [...departmentIds, ""], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="subject"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>
              موضوع الشكوى <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="أدخل عنواناً ملخصاً للشكوى"
                  className={cn("h-11", isOcr("subject") && "pe-10")}
                />
                {isOcr("subject") && (
                  <OcrFieldIcon className="absolute end-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="complaintTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                الفئة <span className="text-destructive">*</span>
              </FormLabel>
              <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full data-[size=default]:h-11">
                    {isOcr("complaintTypeId") && <OcrFieldIcon />}
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {complaintTypes?.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receptionMethodId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>طريقة الاستلام</FormLabel>
              <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full data-[size=default]:h-11">
                    {isOcr("receptionMethodId") && <OcrFieldIcon />}
                    <SelectValue placeholder="اختر طريقة الاستلام" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {receptionMethods?.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="border-t border-border pt-6">
        <div className="mb-4">
          <FormLabel className="mb-1 block">
            الجهات المعنية <span className="text-destructive">*</span>
          </FormLabel>
          <p className="font-body text-body-sm text-muted-foreground">
            يمكنك اختيار أكثر من جهة لتتولى الرد على الشكوى.
          </p>
        </div>

        <div className="space-y-3">
          {departmentIds.map((_value, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <Select
                  dir="rtl"
                  value={departmentIds[index] || ""}
                  onValueChange={(value) => setDepartmentId(index, value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full data-[size=default]:h-11">
                      {index === 0 && isOcr("departmentId") && <OcrFieldIcon />}
                      <SelectValue placeholder={`اختر الجهة ${index + 1}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departmentsForRow(index).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDepartment(index)}
                disabled={departmentIds.length <= 1}
                title="إزالة الجهة"
                className="h-11 w-11 shrink-0 rounded-md text-muted-foreground hover:text-destructive disabled:opacity-40"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        {availableDepartments.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDepartment}
            className="mt-3 gap-2"
          >
            <Plus className="size-4" />
            إضافة جهة أخرى
          </Button>
        )}
        {form.formState.errors.departmentIds?.root?.message && (
          <p className="text-sm text-destructive mt-2">
            {form.formState.errors.departmentIds.root.message}
          </p>
        )}
      </div>

      <div className="border-t border-border pt-6">
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
      </div>
    </div>
  );
}