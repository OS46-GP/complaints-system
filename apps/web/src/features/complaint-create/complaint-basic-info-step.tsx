import { useQuery } from "@tanstack/react-query";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { complaintsApi } from "@/features/complaint-list/api";

const SEVERITY_OPTIONS: { value: ComplaintCreateFormData["severity"]; label: string }[] = [
  { value: "High", label: "عاجل" },
  { value: "Medium", label: "متوسط" },
  { value: "Low", label: "عادي" },
];

interface ComplaintBasicInfoStepProps {
  data: ComplaintCreateFormData;
  onChange: (partial: Partial<ComplaintCreateFormData>) => void;
}

export function ComplaintBasicInfoStep({ data, onChange }: ComplaintBasicInfoStepProps) {
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: complaintsApi.getDepartments,
  });

  const { data: complaintTypes } = useQuery({
    queryKey: ["complaint-types"],
    queryFn: complaintsApi.getComplaintTypes,
  });

  const { data: receptionMethods } = useQuery({
    queryKey: ["reception-methods"],
    queryFn: complaintsApi.getReceptionMethods,
  });

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
                onChange={(e) => onChange({ severity: e.target.value as ComplaintCreateFormData["severity"] })}
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
          <Label>الفئة</Label>
          <select
            value={data.complaintTypeId}
            onChange={(e) => onChange({ complaintTypeId: e.target.value })}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          >
            <option value="">اختر الفئة</option>
            {complaintTypes?.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
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
            {receptionMethods?.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.name}</option>
            ))}
          </select>
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
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
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

      <div className="border-t border-border pt-6">
        <p className="font-heading text-headline-md text-foreground mb-4">معلومات المواطن</p>
        <div className="flex flex-col gap-2 mb-4">
          <Label>الاسم الكامل</Label>
          <Input
            value={data.citizen.fullName}
            onChange={(e) => onChange({ citizen: { ...data.citizen, fullName: e.target.value } })}
            placeholder="الاسم الكامل للمواطن"
            className="h-11"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>رقم الهوية</Label>
            <Input
              value={data.citizen.nationalId}
              onChange={(e) => onChange({ citizen: { ...data.citizen, nationalId: e.target.value } })}
              placeholder="رقم الهوية (اختياري)"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>رقم الجوال</Label>
            <Input
              value={data.citizen.mobileNumber}
              onChange={(e) => onChange({ citizen: { ...data.citizen, mobileNumber: e.target.value } })}
              placeholder="رقم الجوال (اختياري)"
              className="h-11"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Label>العنوان</Label>
          <Input
            value={data.citizen.address}
            onChange={(e) => onChange({ citizen: { ...data.citizen, address: e.target.value } })}
            placeholder="العنوان (اختياري)"
            className="h-11"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label>القرية</Label>
            <Input
              value={data.citizen.village}
              onChange={(e) => onChange({ citizen: { ...data.citizen, village: e.target.value } })}
              placeholder="القرية (اختياري)"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>المركز</Label>
            <Input
              value={data.citizen.district}
              onChange={(e) => onChange({ citizen: { ...data.citizen, district: e.target.value } })}
              placeholder="المركز (اختياري)"
              className="h-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
