import { useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, History, Search, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";
import { OcrFieldIcon } from "@/features/complaint-create/ocr-field-icon";
import { ComplaintPreviewDialog } from "@/features/complaint-create/complaint-preview-dialog";
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
import { useLocations } from "@/features/complaint-list/hooks";
import { complaintsApi } from "@/features/complaint-list/api";
import { type ApiComplaint, type LocationItem } from "@/features/complaint-list/types";

interface ComplaintCitizenStepProps {
  ocrFields?: Set<string>;
}

function caseStatusLabel(complaint: ApiComplaint): string {
  if (complaint.caseStatus) {
    return complaint.caseStatus === "FINISHED" ? "تم الفحص" : "قيد الفحص";
  }
  return complaint.examinationStatus?.name ?? "—";
}

function ancestorNameWithLevel(
  locations: LocationItem[],
  location: LocationItem,
  targetLevel: number,
): string {
  let current = location;
  while (current.parentCode) {
    const parent = locations.find((item) => item.code === current.parentCode);
    if (!parent) break;
    current = parent;
    if (current.level === targetLevel) return current.name;
  }
  return "";
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/^(مركز|محافظة|قرية|مدينة|وحدة محلية)\s+/, "")
    .replace(/\s+/g, "")
    .trim();
}

function nameMatches(a: string, b: string): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return normalizeName(a) === normalizeName(b);
}

export function ComplaintCitizenStep({ ocrFields }: ComplaintCitizenStepProps) {
  const form = useFormContext<ComplaintCreateFormValues>();
  const isOcr = (field: string) => ocrFields?.has(field) ?? false;
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

  const villagesForCenter = useMemo(
    () =>
      (centerCode: string, centerLevelDesc: string | null): LocationItem[] => {
        const result: LocationItem[] = [];
        const seenNames = new Set<string>();
        const maxLevel = centerLevelDesc === "مدينة" ? 5 : 4;
        const visit = (code: string) => {
          for (const child of childrenByParent.get(code) ?? []) {
            if (child.level <= maxLevel) {
              if (!seenNames.has(child.name)) {
                seenNames.add(child.name);
                result.push(child);
              }
              if (child.level < maxLevel) visit(child.code);
            }
          }
        };
        visit(centerCode);
        return result.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      },
    [childrenByParent],
  );

  const district = form.watch("citizen.district");
  const selectedCenter = centers.find(
    (center) =>
      center.name === district ||
      normalizeName(center.name) === normalizeName(district),
  );
  const villages = useMemo(
    () =>
      selectedCenter
        ? villagesForCenter(selectedCenter.code, selectedCenter.levelDesc)
        : [],
    [villagesForCenter, selectedCenter],
  );

  const villageName = form.watch("citizen.village");
  const villageOptions = useMemo(() => {
    if (!villageName) return villages;
    const exists = villages.some(
      (village) => nameMatches(village.name, villageName),
    );
    if (exists) return villages;
    return [
      ...villages,
      {
        code: villageName,
        name: villageName,
        parentCode: null,
        level: 0,
        levelDesc: null,
      },
    ];
  }, [villages, villageName]);

  const [isCitizenLookupLoading, setIsCitizenLookupLoading] = useState(false);
  const lookedUpNationalId = useRef<string>("");

  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyComplaints, setHistoryComplaints] = useState<ApiComplaint[]>([]);
  const [hasSearchedHistory, setHasSearchedHistory] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ApiComplaint | null>(null);
  const [historyNationalId, setHistoryNationalId] = useState("");

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

  const resetCitizenHistory = () => {
    setHistoryComplaints([]);
    setHasSearchedHistory(false);
    setSelectedComplaint(null);
    setHistoryNationalId("");
  };

  const handleNationalIdChange = (value: string, onFieldChange: (value: string) => void) => {
    onFieldChange(value);
    if (
      (lookedUpNationalId.current && value.trim() !== lookedUpNationalId.current) ||
      (historyNationalId && value.trim() !== historyNationalId)
    ) {
      lookedUpNationalId.current = "";
      clearLookedUpCitizen();
      if (value.trim() !== historyNationalId) {
        resetCitizenHistory();
      }
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
        let district = citizen.district ?? "";
        let village = citizen.village ?? "";
        const location = citizen.locationCode
          ? (locations ?? []).find(
              (item) => item.code === citizen.locationCode,
            )
          : (locations ?? []).find(
              (item) =>
                item.level > 2 && village && nameMatches(item.name, village),
            );
        if (location) {
          if (!district) {
            district =
              location.level === 2
                ? location.name
                : ancestorNameWithLevel(locations ?? [], location, 2);
          }
          if (!village && (location.level ?? 0) >= 2) {
            village = location.name;
          }
        }
        form.setValue("citizen", {
          ...form.getValues("citizen"),
          fullName: citizen.fullName,
          mobileNumber: citizen.mobileNumber || "",
          address: citizen.address || "",
          village,
          district,
        });
        lookedUpNationalId.current = form.getValues("citizen.nationalId").trim();
        toast.success("تم العثور على المواطن وإكمال بياناته تلقائياً");
        void searchCitizenHistory();
      } else {
        toast.error("لم يتم العثور على مواطن بهذا الرقم القومي");
      }
    } catch {
      toast.error("تعذر جلب بيانات المواطن");
    } finally {
      setIsCitizenLookupLoading(false);
    }
  };

  const searchCitizenHistory = async () => {
    const nationalId = form.getValues("citizen.nationalId").trim();
    if (!nationalId) return;
    if (nationalId !== historyNationalId) {
      setHistoryComplaints([]);
      setHasSearchedHistory(false);
      setHistoryNationalId(nationalId);
    }
    setIsHistoryLoading(true);
    try {
      const response = await complaintsApi.list({
        citizenNationalId: nationalId,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setHistoryComplaints(response.data);
      setHasSearchedHistory(true);
    } catch {
      toast.error("تعذر جلب شكاوى المواطن السابقة");
      setHasSearchedHistory(false);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openCitizenHistory = async () => {
    const nationalId = form.getValues("citizen.nationalId").trim();
    if (!nationalId) return;
    if (historyNationalId !== nationalId || !hasSearchedHistory) {
      await searchCitizenHistory();
    }
  };

  const nationalIdValue = form.watch("citizen.nationalId");

  return (
    <div className="space-y-6">
      <p className="font-heading text-headline-md text-foreground">معلومات المواطن</p>

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
          <FormItem>
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
          <FormItem>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  const center = centers.find(
                    (item) =>
                      item.name === value ||
                      normalizeName(item.name) === normalizeName(value),
                  );
                  const currentVillage = form.getValues("citizen.village");
                  const villageStillValid =
                    !!center &&
                    (currentVillage
                      ? villagesForCenter(
                          center.code,
                          center.levelDesc,
                        ).some((v) => nameMatches(v.name, currentVillage))
                      : false);
                  if (!villageStillValid) {
                    form.setValue("citizen.village", "");
                  }
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
                  {villageOptions.map((village) => (
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

      <div className="border-t border-border pt-6">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="text-right">
            <h3 className="font-heading text-title-sm text-foreground flex items-center gap-1.5">
              <History className="size-4 text-primary" />
              شكاوى المواطن السابقة
            </h3>
            <p className="font-body text-body-sm text-muted-foreground mt-1">
              اعرض الشكاوى المسجلة مسبقاً لنفس الرقم القومي لتجنب تكرار التسجيل.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCitizenHistory}
            disabled={isHistoryLoading || !nationalIdValue.trim()}
            className="gap-2"
          >
            {isHistoryLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            البحث عن الشكاوى السابقة
          </Button>
        </div>

        {isHistoryLoading && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
            <p className="font-body text-body-md text-muted-foreground">
              جارٍ البحث عن شكاوى المواطن السابقة...
            </p>
          </div>
        )}

        {!isHistoryLoading && hasSearchedHistory && (
          <>
            {historyComplaints.length > 0 ? (
              <ul className="space-y-2">
                {historyComplaints.map((complaint) => (
                  <li key={complaint.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedComplaint(complaint)}
                      className="w-full rounded-lg border border-border bg-surface-container-lowest p-3 flex items-center gap-3 text-start transition-colors hover:bg-surface-container-low cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-label-sm text-foreground truncate">
                          #{complaint.complaintNumber}-{complaint.statementYear} —{" "}
                          {complaint.subject}
                        </p>
                        <p className="text-label-sm text-muted-foreground mt-0.5">
                          {caseStatusLabel(complaint)} ·{" "}
                          {new Date(complaint.arrivalDate).toLocaleDateString("ar-SA")}
                          {complaint.complaintType?.name
                            ? ` · ${complaint.complaintType.name}`
                            : ""}
                        </p>
                      </div>
                      <ChevronLeft
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low text-muted-foreground">
                <Inbox className="size-5 shrink-0" />
                <p className="font-body text-body-md">
                  لا توجد شكاوى سابقة مسجلة لهذا المواطن.
                </p>
              </div>
            )}
          </>
        )}

        <ComplaintPreviewDialog
          open={!!selectedComplaint}
          onOpenChange={(open) => {
            if (!open) setSelectedComplaint(null);
          }}
          complaint={selectedComplaint}
        />
      </div>
    </div>
  );
}