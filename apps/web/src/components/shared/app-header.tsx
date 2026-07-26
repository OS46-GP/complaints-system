import { User, Settings } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { SearchBar } from "@/components/shared/search-bar";
import { SearchDialog } from "@/components/shared/search-dialog";
import { UserNav, type UserNavItem } from "@/components/shared/user-nav";
import { cn } from "@/lib/utils";

const userMenuItems: UserNavItem[] = [
  { label: "الملف الشخصي", icon: User, path: "/profile" },
  { label: "الإعدادات", icon: Settings, path: "/settings" },
];

export function AppHeader({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
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
        <ModeToggle />
        <NotificationBell />
        <div className="mx-1 h-8 w-px bg-border md:mx-2" />
        <UserNav
          name="أحمد الخالدي"
          role="مدير النظام"
          src="https://github.com/shadcn.png"
          fallback="أخ"
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
