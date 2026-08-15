import { List } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SettingCard } from "./setting-card";
import { usePreferences } from "./store";

const SORT_FIELD_LABELS: Record<string, string> = {
  complaintNumber: "رقم الشكوى",
  createdAt: "تاريخ الإنشاء",
  severity: "الأولوية",
  subject: "الموضوع",
  arrivalDate: "تاريخ الوصول",
  statementYear: "سنة البيان",
};

export function ComplaintListCard() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <SettingCard
      icon={List}
      title="قائمة الشكاوى"
      className="md:col-span-2 xl:col-span-3"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Label htmlFor="pageSize">عدد الشكاوى في الصفحة</Label>
          <Select
            dir="rtl"
            value={String(preferences.complaints.pageSize)}
            onValueChange={(value) =>
              updatePreferences({
                complaints: { pageSize: Number(value) },
              })
            }
          >
            <SelectTrigger id="pageSize" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="sortBy">الترتيب الافتراضي حسب</Label>
          <Select
            dir="rtl"
            value={preferences.complaints.sortBy}
            onValueChange={(value) =>
              updatePreferences({ complaints: { sortBy: value } })
            }
          >
            <SelectTrigger id="sortBy" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_FIELD_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="sortOrder">اتجاه الترتيب</Label>
          <Select
            dir="rtl"
            value={preferences.complaints.sortOrder}
            onValueChange={(value) =>
              updatePreferences({
                complaints: { sortOrder: value as "asc" | "desc" },
              })
            }
          >
            <SelectTrigger id="sortOrder" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">تنازلي</SelectItem>
              <SelectItem value="asc">تصاعدي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SettingCard>
  );
}
