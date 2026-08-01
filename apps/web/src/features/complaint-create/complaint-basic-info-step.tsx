import { useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";
import { OcrFieldIcon } from "@/features/complaint-create/ocr-field-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  useDepartments,
  useComplaintTypes,
  useReceptionMethods,
  useLocations,
} from "@/features/complaint-list/hooks";
import { complaintsApi } from "@/features/complaint-list/api";
import type { LocationItem } from "@/features/complaint-list/types";

const SEVERITY_OPTIONS: { value: ComplaintCreateFormValues["severity"]; label: string }[] = [
  { value: "High", label: "عاجل" },
  { value: "Medium", label: "متوسط" },
  { value: "Low", label: "عادي" },
];

interface ComplaintBasicInfoStepProps {
  ocrFields?: Set<string>;
}

export function ComplaintBasicInfoStep({ ocrFields }: ComplaintBasicInfoStepProps) {
  const form = useFormContext<ComplaintCreateFormValues>();
  const isOcr = (field: string) => ocrFields?.has(field) ?? false;
  const { data: departments } = useDepartments();
  const { data: complaintTypes } = useComplaintTypes();
  const { data: receptionMethods } = useReceptionMethods();
  const { data: locations } = useLocations();

  const centers = useMemo(
    () => (locations ?? []).filter((location) => location.level === 2),
    [locations],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, LocationItem[]>();
    for (const location of locations ?? []) {
      if (!location.parentCode) continue;
      const list = map.get(location.parentCode) ?? [];
      list.push(location);
      map.set(location.parentCode, list);
    }
    return map;
  }, [locations]);

  const villagesForCenter = (centerCode: string): LocationItem[] => {
    const result: LocationItem[] = [];
    const seenNames = new Set<string>();
    const visit = (code: string) => {
      for (const child of childrenByParent.get(code) ?? []) {
        if (child.level <= 4) {
          if (!seenNames.has(child.name)) {
            seenNames.add(child.name);
            result.push(child);
          }
          if (child.level < 4) visit(child.code);
        }
      }
    };
    visit(centerCode);
    return result.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  };

  const district = form.watch("citizen.district");
  const selectedCenter = centers.find((center) => center.name === district);
  const villages = selectedCenter ? villagesForCenter(selectedCenter.code) : [];

  const [isCitizenLookupLoading, setIsCitizenLookupLoading] = useState(false);
  const lookedUpNationalId = useRef<string>("");

  const clearLookedUpCitizen = () => {
    const citizen = form.getValues("citizen");
    if (
      citizen.fullName ||
      citizen.mobileNumber ||
      citizen.address ||
      citizen.village ||
      citizen.district
    ) {
      form.setValue("citizen", {
        ...citizen,
        fullName: "",
        mobileNumber: "",
        address: "",
        village: "",
        district: "",
      });
      toast.info("تم مسح بيانات المواطن بعد تغيير الرقم القومي");
    }
  };

  const handleNationalIdChange = (value: string, onFieldChange: (value: string) => void) => {
    onFieldChange(value);
    if (lookedUpNationalId.current && value.trim() !== lookedUpNationalId.current) {
      lookedUpNationalId.current = "";
      clearLookedUpCitizen();
    }
  };

  const lookupCitizen = async () => {
    const isValid = await form.trigger("citizen.nationalId");
    if (!isValid) return;
    setIsCitizenLookupLoading(true);
    try {
      const citizen = await complaintsApi.getCitizenByNationalId(
        form.getValues("citizen.nationalId").trim(),
      );
      if (citizen) {
        form.setValue("citizen", {
          ...form.getValues("citizen"),
          fullName: citizen.fullName,
          mobileNumber: citizen.mobileNumber || "",
          address: citizen.address || "",
          village: citizen.village || "",
          district: citizen.district || "",
        });
        lookedUpNationalId.current = form.getValues("citizen.nationalId").trim();
        toast.success("تم العثور على المواطن وإكمال بياناته تلقائياً");
      } else {
        toast.error("لم يتم العثور على مواطن بهذا الرقم القومي");
      }
    } catch {
      toast.error("تعذر جلب بيانات المواطن");
    } finally {
      setIsCitizenLookupLoading(false);
    }
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

      <FormField
        control={form.control}
        name="severity"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>الأولوية</FormLabel>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map((option) => (
                <label key={option.value} className="flex-1">
                  <Input
                    type="radio"
                    name="severity"
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={() => field.onChange(option.value)}
                    className="hidden peer"
                  />
                  <div
                    className={cn(
                      "h-11 border border-input rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all font-heading text-label-sm px-1 hover:bg-surface-container-low peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary hover:peer-checked:bg-primary hover:peer-checked:text-primary-foreground",
                      fieldState.invalid && "border-destructive",
                    )}
                  >
                    {field.value === option.value && isOcr("severity") && (
                      <OcrFieldIcon className="peer-checked:text-primary-foreground [&_svg]:size-3.5" />
                    )}
                    {option.label}
                  </div>
                </label>
              ))}
            </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجهة المعنية</FormLabel>
              <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full data-[size=default]:h-11">
                    {isOcr("departmentId") && <OcrFieldIcon />}
                    <SelectValue placeholder="اختر الجهة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="respondentName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>اسم المقدم</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="الاسم (اختياري)"
                    className={cn("h-11", isOcr("respondentName") && "pe-10")}
                  />
                  {isOcr("respondentName") && (
                    <OcrFieldIcon className="absolute end-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="border-t border-border pt-6">
        <p className="font-heading text-headline-md text-foreground mb-4">معلومات المواطن</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="citizen.nationalId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>الرقم القومي</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        onChange={(e) =>
                          handleNationalIdChange(e.target.value, field.onChange)
                        }
                        placeholder="الرقم القومي"
                        className={cn(
                          "h-11",
                          isOcr("citizen.nationalId") && "pe-10",
                        )}
                      />
                      {isOcr("citizen.nationalId") && (
                        <OcrFieldIcon className="absolute end-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      onClick={lookupCitizen}
                      disabled={isCitizenLookupLoading || !field.value.trim()}
                      title="البحث عن بيانات المواطن"
                      className="h-11 w-11 shrink-0 rounded-md active:not-aria-[haspopup]:translate-y-0"
                    >
                      {isCitizenLookupLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Search className="size-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="citizen.mobileNumber"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>رقم الجوال</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="رقم الجوال (اختياري)"
                      className={cn("h-11", isOcr("citizen.mobileNumber") && "pe-10")}
                    />
                    {isOcr("citizen.mobileNumber") && (
                      <OcrFieldIcon className="absolute end-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="citizen.fullName"
          render={({ field, fieldState }) => (
            <FormItem className="mt-4">
              <FormLabel>
                الاسم الكامل <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="الاسم الكامل للمواطن"
                    className={cn("h-11", isOcr("citizen.fullName") && "pe-10")}
                  />
                  {isOcr("citizen.fullName") && (
                    <OcrFieldIcon className="absolute end-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="citizen.address"
          render={({ field, fieldState }) => (
            <FormItem className="mt-4">
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="العنوان (اختياري)"
                    className={cn("h-11", isOcr("citizen.address") && "pe-10")}
                  />
                  {isOcr("citizen.address") && (
                    <OcrFieldIcon className="absolute end-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name="citizen.district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المركز</FormLabel>
                <Select
                  dir="rtl"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("citizen.village", "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full data-[size=default]:h-11">
                      {isOcr("citizen.district") && <OcrFieldIcon />}
                      <SelectValue placeholder="اختر المركز" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.code} value={center.name}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="citizen.village"
            render={({ field }) => (
              <FormItem>
                <FormLabel>القرية</FormLabel>
                <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger
                      disabled={!selectedCenter}
                      className="w-full data-[size=default]:h-11"
                    >
                      {isOcr("citizen.village") && <OcrFieldIcon />}
                      <SelectValue placeholder={selectedCenter ? "اختر القرية" : "اختر المركز أولاً"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village.code} value={village.name}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
