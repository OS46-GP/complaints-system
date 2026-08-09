import { Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Settings,
  User,
  Radio,
  FileBarChart,
  ScanLine,
  Clock,
  SlidersHorizontal,
  CalendarClock,
  Zap,
  FileText,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { PATHS } from "@/router/paths";
import type { NavGroup } from "@/components/shared/sidebar-nav";

const navGroups: NavGroup[] = [
  {
    items: [
      { title: "لوحة التحكم", url: PATHS.USER.DASHBOARD, icon: LayoutDashboard },
    ],
  },
  {
    label: "الشكاوى",
    items: [
      { title: "الشكاوى", url: PATHS.USER.COMPLAINTS, icon: ClipboardList },
      {
        title: "شكوى عبر الماسح الضوئي",
        url: PATHS.USER.COMPLAINT_OCR,
        icon: ScanLine,
      },
      { title: "شكوى جديدة", url: PATHS.USER.NEW_COMPLAINT, icon: PlusCircle },
    ],
  },
  {
    label: "التقارير",
    items: [
      {
        title: "لوحة التقارير",
        url: PATHS.USER.REPORTS.DASHBOARD,
        icon: FileBarChart,
      },
      {
        title: "تقرير المتأخرات حسب الجهة",
        url: PATHS.USER.REPORTS.DELAYS,
        icon: Clock,
      },
      {
        title: "تقرير مخصص",
        url: PATHS.USER.REPORTS.CUSTOM,
        icon: SlidersHorizontal,
      },
      {
        title: "التقارير المجدولة",
        url: PATHS.USER.REPORTS.SCHEDULED,
        icon: CalendarClock,
      },
      {
        title: "تقرير عند الطلب",
        url: PATHS.USER.REPORTS.ON_DEMAND,
        icon: Zap,
      },
      {
        title: "خطاب / مذكرة",
        url: PATHS.USER.REPORTS.MEMO,
        icon: FileText,
      },
    ],
  },
  {
    items: [
      {
        title: "مراقبة وسائل التواصل",
        url: PATHS.USER.SOCIAL_MONITORING,
        icon: Radio,
      },
    ],
  },
  {
    items: [
      { title: "الإعدادات", url: PATHS.USER.SETTINGS, icon: Settings },
    ],
  },
];

export default function UserLayout() {
  const location = useLocation();

  const items = navGroups
    .flatMap((group) => group.items)
    .map((item) => ({
      ...item,
      isActive: location.pathname.startsWith(item.url),
    }));

  const currentTitle = items.find((i) => i.isActive)?.title ?? "لوحة المستخدم";

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        groups={navGroups}
        brand={{
          title: "نظام الشكاوى",
          subtitle: "بوابة المستخدم",
          icon: User,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={currentTitle} />
        <main className="flex-1 overflow-auto p-4 md:p-container-padding bg-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
