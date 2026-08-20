import { memo, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";
import type { DepartmentAssignmentFormValue } from "@/features/complaint-create/types";
import { OcrFieldIcon } from "@/features/complaint-create/ocr-field-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const { data: complaintTypes } = useComplaintTypes();
  const { data: receptionMethods } = useReceptionMethods();

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
                  <OcrFieldIcon className="absolute end-3 top-2.5" />
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

      <DepartmentAssignmentsSection isOcr={isOcr} />

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

const DepartmentAssignmentsSection = memo(function DepartmentAssignmentsSection({
  isOcr,
}: {
  isOcr: (field: string) => boolean;
}) {
  const form = useFormContext<ComplaintCreateFormValues>();
  const { data: departments } = useDepartments();
  const watchedDepartments = form.watch("departments");
  const assignments = useMemo(
    () => watchedDepartments ?? [],
    [watchedDepartments],
  );

  const selectedDepartmentIds = useMemo(
    () => assignments.map((assignment) => assignment.departmentId),
    [assignments],
  );

  const availableDepartments = useMemo(
    () =>
      (departments ?? []).filter(
        (department) => !selectedDepartmentIds.includes(department.id),
      ),
    [departments, selectedDepartmentIds],
  );

  const updateAssignment = (
    index: number,
    patch: Partial<DepartmentAssignmentFormValue>,
  ) => {
    const next: DepartmentAssignmentFormValue[] = assignments.map((assignment, i) =>
      i === index ? { ...assignment, ...patch } : assignment,
    );
    form.setValue("departments", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const setDepartmentId = (index: number, value: string) => {
    updateAssignment(index, { departmentId: value });
  };

  const removeDepartment = (index: number) => {
    form.setValue(
      "departments",
      assignments.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const addDepartment = () => {
    form.setValue(
      "departments",
      [
        ...assignments,
        { departmentId: "", outgoingLetterNumber: "", outgoingLetterDate: "", responseDeadlineDays: "" },
      ],
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const errorAt = (index: number, field: keyof DepartmentAssignmentFormValue) =>
    (form.formState.errors.departments?.[index] as
      | { [key in keyof DepartmentAssignmentFormValue]?: { message?: string } }
      | undefined)?.[field]?.message;

  return (
    <div className="border-t border-border pt-6">
      <div className="mb-4">
        <FormLabel className="mb-1 block">
          الجهات المعنية <span className="text-destructive">*</span>
        </FormLabel>
        <p className="font-body text-body-sm text-muted-foreground">
          يمكنك اختيار أكثر من جهة لتتولى الرد على الشكوى، وتحديد بيانات الصادر والمهلة لكل جهة.
        </p>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <DepartmentRow
            key={index}
            index={index}
            assignment={assignment}
            departments={departments ?? []}
            selectedDepartmentIds={selectedDepartmentIds}
            isOcr={isOcr}
            onDepartmentChange={setDepartmentId}
            onFieldChange={updateAssignment}
            onRemove={removeDepartment}
            canRemove={assignments.length > 1}
            errorAt={errorAt}
          />
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
      {form.formState.errors.departments?.root?.message && (
        <p className="text-sm text-destructive mt-2">
          {form.formState.errors.departments.root.message}
        </p>
      )}
    </div>
  );
});

interface DepartmentRowProps {
  index: number;
  assignment: DepartmentAssignmentFormValue;
  departments: { id: string; name: string; subAuthority: string | null }[];
  selectedDepartmentIds: string[];
  isOcr: (field: string) => boolean;
  onDepartmentChange: (index: number, value: string) => void;
  onFieldChange: (index: number, patch: Partial<DepartmentAssignmentFormValue>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  errorAt: (index: number, field: keyof DepartmentAssignmentFormValue) => string | undefined;
}

const DepartmentRow = memo(function DepartmentRow({
  index,
  assignment,
  departments,
  selectedDepartmentIds,
  isOcr,
  onDepartmentChange,
  onFieldChange,
  onRemove,
  canRemove,
  errorAt,
}: DepartmentRowProps) {
  const departmentsForRow = useMemo(
    () =>
      departments.filter(
        (department) =>
          !selectedDepartmentIds.some(
            (id, rowIndex) => rowIndex !== index && id === department.id,
          ),
      ),
    [departments, selectedDepartmentIds, index],
  );

  return (
    <div className="rounded-lg border border-border bg-surface-container-low p-3 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Select
            dir="rtl"
            value={assignment.departmentId}
            onValueChange={(value) => onDepartmentChange(index, value)}
          >
            <FormControl>
              <SelectTrigger className="w-full data-[size=default]:h-11">
                {index === 0 && isOcr("departmentId") && <OcrFieldIcon />}
                <SelectValue placeholder={`اختر الجهة ${index + 1}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {departmentsForRow.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.subAuthority ? `${d.name} — ${d.subAuthority}` : d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorAt(index, "departmentId") && (
            <p className="text-sm text-destructive mt-1">{errorAt(index, "departmentId")}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          title="إزالة الجهة"
          className="h-11 w-11 shrink-0 rounded-md text-muted-foreground hover:text-destructive disabled:opacity-40"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>رقم الصادر <span className="text-destructive">*</span></Label>
          <Input
            value={assignment.outgoingLetterNumber}
            onChange={(e) =>
              onFieldChange(index, { outgoingLetterNumber: e.target.value })
            }
            placeholder="رقم خطاب الصادر"
            className="h-11"
          />
          {errorAt(index, "outgoingLetterNumber") && (
            <p className="text-sm text-destructive">{errorAt(index, "outgoingLetterNumber")}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>تاريخ الصادر <span className="text-destructive">*</span></Label>
          <Input
            type="date"
            value={assignment.outgoingLetterDate}
            onChange={(e) =>
              onFieldChange(index, { outgoingLetterDate: e.target.value })
            }
            className="h-11"
          />
          {errorAt(index, "outgoingLetterDate") && (
            <p className="text-sm text-destructive">{errorAt(index, "outgoingLetterDate")}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>مدة الرد (أيام) <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            min={1}
            value={assignment.responseDeadlineDays}
            onChange={(e) =>
              onFieldChange(index, { responseDeadlineDays: e.target.value })
            }
            placeholder="مثال: 30"
            className="h-11"
          />
          {errorAt(index, "responseDeadlineDays") && (
            <p className="text-sm text-destructive">{errorAt(index, "responseDeadlineDays")}</p>
          )}
        </div>
      </div>
    </div>
  );
});