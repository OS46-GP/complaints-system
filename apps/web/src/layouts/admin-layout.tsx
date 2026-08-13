import { Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
  FileBarChart,
  BarChart3,
  Settings,
  Shield,
  Radio,
  Tags,
  Inbox,
  ScanLine,
  PlusCircle,
  CalendarClock,
  FileStack,
  Landmark,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { PageTransition } from "@/components/shared/page-transition";
import { PATHS } from "@/router/paths";
import type { NavGroup } from "@/components/shared/sidebar-nav";

const navGroups: NavGroup[] = [
  {
    items: [
      { title: "لوحة التحكم", url: PATHS.ADMIN.DASHBOARD, icon: LayoutDashboard },
    ],
  },
  {
    label: "الشكاوى",
    items: [
      { title: "الشكاوى", url: PATHS.ADMIN.COMPLAINTS, icon: ClipboardList },
      {
        title: "إحالات بانتظار الرد",
        url: PATHS.ADMIN.DUE_ASSIGNMENTS,
        icon: CalendarClock,
      },
      {
        title: "شكوى عبر الماسح الضوئي",
        url: PATHS.ADMIN.COMPLAINT_OCR,
        icon: ScanLine,
      },
      {
        title: "شكوى جديدة",
        url: PATHS.ADMIN.NEW_COMPLAINT,
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { title: "الجهات المعنية", url: PATHS.ADMIN.DEPARTMENTS, icon: Building2 },
      { title: "الفئات", url: PATHS.ADMIN.COMPLAINT_TYPES, icon: Tags },
      { title: "طرق الاستلام", url: PATHS.ADMIN.RECEPTION_METHODS, icon: Inbox },
      { title: "نماذج الخطابات", url: PATHS.ADMIN.LETTER_TEMPLATES, icon: FileStack },
      { title: "بيانات الجهة والخطابات", url: PATHS.ADMIN.LETTER_SETTINGS, icon: Landmark },
      { title: "الموظفون", url: PATHS.ADMIN.USERS, icon: Users },
    ],
  },
  {
    label: "المراقبة والتقارير",
    items: [
      {
        title: "مراقبة السوشيال ميديا",
        url: PATHS.ADMIN.SOCIAL_MONITORING,
        icon: Radio,
      },
      {
        title: "التقارير",
        url: PATHS.ADMIN.REPORTS.DASHBOARD,
        icon: FileBarChart,
      },
      { title: "التحليلات", url: "#", icon: BarChart3 },
    ],
  },
  {
    items: [
      { title: "الإعدادات", url: PATHS.ADMIN.SETTINGS, icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();

  const items = navGroups
    .flatMap((group) => group.items)
    .map((item) => ({
      ...item,
      isActive: item.url !== "#" && location.pathname.startsWith(item.url),
    }));

  const currentTitle = items.find((i) => i.isActive)?.title ?? "لوحة الإدارة";

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        groups={navGroups}
        brand={{
          title: "نظام الشكاوى",
          subtitle: "إدارة المؤسسة",
          icon: Shield,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={currentTitle} />
        <main className="flex-1 overflow-auto p-4 md:p-container-padding bg-background">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </SidebarProvider>
  );
}
