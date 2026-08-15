import { User, Settings } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { SearchBar } from "@/components/shared/search-bar";
import { SearchDialog } from "@/components/shared/search-dialog";
import { UserNav, type UserNavItem } from "@/components/shared/user-nav";
import { NotificationBell } from "@/features/notifications/notification-bell";
import { useAuthStore } from "@/features/auth/store";
import { PATHS } from "@/router/paths";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  Admin: "مدير النظام",
  Official: "موظف",
  SuperAdmin: "مدير النظام الأعلى",
};

const USER_MANAGEMENT_PATHS: Record<string, { profile: string; settings: string }> = {
  Admin: { profile: PATHS.ADMIN.PROFILE, settings: PATHS.ADMIN.SETTINGS },
  SuperAdmin: {
    profile: PATHS.SUPER_ADMIN.PROFILE,
    settings: PATHS.SUPER_ADMIN.SETTINGS,
  },
  Official: { profile: PATHS.USER.PROFILE, settings: PATHS.USER.SETTINGS },
};

export function AppHeader({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.fullName || user?.username || "مستخدم";
  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : "";
  const roleKey =
    user?.role === "SuperAdmin"
      ? "SuperAdmin"
      : user?.role === "Admin"
        ? "Admin"
        : "Official";
  const rolePaths = USER_MANAGEMENT_PATHS[roleKey] ?? USER_MANAGEMENT_PATHS.Official;

  const userMenuItems: UserNavItem[] = [
    {
      label: "الملف الشخصي",
      icon: User,
      path: rolePaths.profile,
    },
    {
      label: "الإعدادات",
      icon: Settings,
      path: rolePaths.settings,
    },
  ];

  return (
    <header
      className={cn(
        "flex h-header-height items-center justify-between gap-2 border-b border-border bg-card px-4 md:px-gutter",
        className,
      )}
    >
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="md:hidden rounded-full" />
        <h2 className="font-heading text-lg font-bold text-primary md:text-xl">
          {title}
        </h2>
      </div>

      <div className="hidden md:mx-8 md:flex md:flex-1 md:max-w-xl md:items-center md:gap-4">
        <SearchBar />
      </div>

      <div className="flex items-center gap-1 md:gap-4">
        <SearchDialog />
        <NotificationBell />
        <ModeToggle />
        <div className="mx-1 h-8 w-px bg-border md:mx-2" />
        <UserNav
          name={displayName}
          role={roleLabel}
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
