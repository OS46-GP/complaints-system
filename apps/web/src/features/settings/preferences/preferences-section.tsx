import {
  Bell,
  LayoutDashboard,
  List,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/shared/theme-provider";

import { usePreferences } from "./store";
import type { Language } from "./types";

const SORT_FIELD_LABELS: Record<string, string> = {
  complaintNumber: "رقم الشكوى",
  createdAt: "تاريخ الإنشاء",
  severity: "الأولوية",
  subject: "الموضوع",
  arrivalDate: "تاريخ الوصول",
  statementYear: "سنة البيان",
};

export function PreferencesSection() {
  const { preferences, updatePreferences, resetPreferences } =
    usePreferences();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sun className="size-4" />
            المظهر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            dir="rtl"
            value={theme}
            onValueChange={(value) =>
              setTheme(value as "light" | "dark" | "system")
            }
            className="flex flex-col gap-3 sm:flex-row sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="flex items-center gap-2">
                <Sun className="size-4" />
                فاتح
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="flex items-center gap-2">
                <Moon className="size-4" />
                داكن
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="flex items-center gap-2">
                <Monitor className="size-4" />
                حسب النظام
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <List className="size-4" />
            اللغة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Label htmlFor="language">لغة الواجهة</Label>
            <Select
              dir="rtl"
              value={preferences.language}
              onValueChange={(value) =>
                updatePreferences({ language: value as Language })
              }
            >
              <SelectTrigger id="language" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <List className="size-4" />
            قائمة الشكاوى
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <LayoutDashboard className="size-4" />
            لوحة المتابعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Label htmlFor="dashboardRange">النطاق الزمني الافتراضي</Label>
            <Select
              dir="rtl"
              value={preferences.dashboard.dateRange}
              onValueChange={(value) =>
                updatePreferences({
                  dashboard: {
                    dateRange: value as "lastYear" | "currentMonth",
                  },
                })
              }
            >
              <SelectTrigger id="dashboardRange" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastYear">السنة الماضية</SelectItem>
                <SelectItem value="currentMonth">الشهر الحالي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Bell className="size-4" />
            الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="emailOnUpdate">
                إشعارات البريد الإلكتروني
              </Label>
              <p className="text-sm text-muted-foreground">
                إشعاري عند تحديث حالة الشكاوى الخاصة بي
              </p>
            </div>
            <Switch
              id="emailOnUpdate"
              checked={preferences.notifications.emailOnUpdate}
              onCheckedChange={(checked) =>
                updatePreferences({ notifications: { emailOnUpdate: checked } })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => {
            resetPreferences();
            setTheme("system");
          }}
        >
          <RotateCcw className="size-4" />
          استعادة الإعدادات الافتراضية
        </Button>
      </div>
    </div>
  );
}
