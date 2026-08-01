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
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { PATHS } from "@/router/paths";

const navItems = [
  { title: "لوحة التحكم", url: PATHS.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { title: "الشكاوى", url: PATHS.ADMIN.COMPLAINTS, icon: ClipboardList },
  { title: "الأقسام", url: "#", icon: Building2 },
  { title: "الموظفون", url: PATHS.ADMIN.USERS, icon: Users },
  { title: "مراقبة السوشيال ميديا", url: PATHS.ADMIN.SOCIAL_MONITORING, icon: Radio },
  { title: "التقارير", url: "#", icon: FileBarChart },
  { title: "التحليلات", url: "#", icon: BarChart3 },
  { title: "الإعدادات", url: PATHS.ADMIN.SETTINGS, icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();

  const items = navItems.map((item) => ({
    ...item,
    isActive: item.url !== "#" && location.pathname.startsWith(item.url),
  }));

  const currentTitle = items.find((i) => i.isActive)?.title ?? "لوحة الإدارة";

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        items={items}
        brand={{
          title: "نظام الشكاوى",
          subtitle: "إدارة المؤسسة",
          icon: Shield,
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
