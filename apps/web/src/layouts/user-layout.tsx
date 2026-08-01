import { Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Settings,
  User,
  Radio,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { PATHS } from "@/router/paths";

const navItems = [
  { title: "لوحة التحكم", url: PATHS.USER.DASHBOARD, icon: LayoutDashboard },
  { title: "الشكاوى", url: PATHS.USER.COMPLAINTS, icon: ClipboardList },
  { title: "شكوى جديدة", url: PATHS.USER.NEW_COMPLAINT, icon: PlusCircle },
  { title: "مراقبة وسائل التواصل", url: PATHS.USER.SOCIAL_MONITORING, icon: Radio },
  { title: "الإعدادات", url: PATHS.USER.SETTINGS, icon: Settings },
];

export default function UserLayout() {
  const location = useLocation();

  const items = navItems.map((item) => ({
    ...item,
    isActive: location.pathname.startsWith(item.url),
  }));

  const currentTitle = items.find((i) => i.isActive)?.title ?? "لوحة المستخدم";

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        items={items}
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
