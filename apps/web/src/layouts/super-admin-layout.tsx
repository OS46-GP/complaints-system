import { Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  Bell,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { PATHS } from "@/router/paths";
import { resolveActiveUrls } from "@/lib/utils";
import type { NavGroup } from "@/components/shared/sidebar-nav";

const navGroups: NavGroup[] = [
  {
    items: [
      {
        title: "لوحة التحكم",
        url: PATHS.SUPER_ADMIN.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "إدارة النظام",
    items: [
      { title: "الموظفون", url: PATHS.SUPER_ADMIN.USERS, icon: Users },
      {
        title: "الإشعارات",
        url: PATHS.NOTIFICATIONS.SUPER_ADMIN,
        icon: Bell,
      },
    ],
  },
  {
    items: [
      { title: "الإعدادات", url: PATHS.SUPER_ADMIN.SETTINGS, icon: Settings },
    ],
  },
];

export default function SuperAdminLayout() {
  const location = useLocation();

  const flatItems = navGroups.flatMap((group) => group.items);
  const activeUrls = resolveActiveUrls(
    location.pathname,
    flatItems.map((i) => i.url),
  );

  const items = flatItems.map((item) => ({
    ...item,
    isActive: item.url !== "#" && activeUrls.has(item.url),
  }));

  const currentTitle = items.find((i) => i.isActive)?.title ?? "إدارة النظام";

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        groups={navGroups}
        brand={{
          title: "نظام الشكاوى",
          subtitle: "الإدارة العليا",
          icon: ShieldCheck,
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
