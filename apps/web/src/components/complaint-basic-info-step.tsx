import type { ComplaintCreateFormData } from "@/types/complaint-create.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COMPLAINT_TYPES = [
  { value: "1", label: "خدمات العملاء" },
  { value: "2", label: "المشاكل التقنية" },
  { value: "3", label: "المرافق والمنشآت" },
  { value: "4", label: "إداري" },
];

const RECEPTION_METHODS = [
  { value: "1", label: "هاتف" },
  { value: "2", label: "بريد إلكتروني" },
  { value: "3", label: "حضوري" },
  { value: "4", label: "منصة إلكترونية" },
];

const DEPARTMENTS = [
  { value: "dept-1", label: "قسم تقنية المعلومات" },
  { value: "dept-2", label: "قسم الموارد البشرية" },
  { value: "dept-3", label: "قسم الشؤون القانونية" },
  { value: "dept-4", label: "قسم العلاقات العامة" },
];

const SEVERITY_OPTIONS = [
  {
    value: "High" as const,
    label: "عاجل",
  },
  {
    value: "Medium" as const,
    label: "متوسط",
  },
  {
    value: "Low" as const,
    label: "عادي",
  },
];

interface ComplaintBasicInfoStepProps {
  data: ComplaintCreateFormData;
  onChange: (partial: Partial<ComplaintCreateFormData>) => void;
}

export function ComplaintBasicInfoStep({ data, onChange }: ComplaintBasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label>موضوع الشكوى</Label>
        <Input
          value={data.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          placeholder="أدخل عنواناً ملخصاً للشكوى"
          className="h-11"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>الفئة</Label>
          <select
            value={data.complaintTypeId}
            onChange={(e) => onChange({ complaintTypeId: e.target.value })}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          >
            <option value="">اختر الفئة</option>
            {COMPLAINT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>طريقة الاستلام</Label>
          <select
            value={data.receptionMethodId}
            onChange={(e) => onChange({ receptionMethodId: e.target.value })}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          >
            <option value="">اختر طريقة الاستلام</option>
            {RECEPTION_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>الأولوية</Label>
        <div className="flex gap-2">
          {SEVERITY_OPTIONS.map((option) => (
            <label key={option.value} className="flex-1">
              <input
                type="radio"
                name="severity"
                value={option.value}
                checked={data.severity === option.value}
                onChange={(e) => onChange({ severity: e.target.value as "High" | "Medium" | "Low" })}
                className="hidden peer"
              />
              <div className="h-11 border border-input rounded-lg flex items-center justify-center cursor-pointer transition-all font-heading text-label-sm px-1 hover:bg-surface-container-low peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary hover:peer-checked:bg-primary hover:peer-checked:text-primary-foreground">
                {option.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>الجهة المعنية</Label>
          <select
            value={data.departmentId}
            onChange={(e) => onChange({ departmentId: e.target.value })}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          >
            <option value="">اختر الجهة</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>اسم المقدم</Label>
          <Input
            value={data.respondentName}
            onChange={(e) => onChange({ respondentName: e.target.value })}
            placeholder="الاسم (اختياري)"
            className="h-11"
          />
        </div>
      </div>
    </div>
  );
}
