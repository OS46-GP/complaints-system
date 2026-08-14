import { type LucideIcon } from "lucide-react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import {
  SidebarNav,
  type NavGroup,
  type NavItem,
} from "@/components/shared/sidebar-nav";
import { LogoutButton } from "@/features/auth/logout-button";

export type { NavGroup, NavItem };

export function AppSidebar({
  groups,
  brand,
}: {
  groups: NavGroup[];
  brand: { title: string; subtitle: string; icon: LucideIcon };
}) {
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="right">
      <SidebarHeader className="relative p-4 pb-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-2">
          <SidebarBrand
            icon={brand.icon}
            title={brand.title}
            subtitle={brand.subtitle}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -left-4 z-20 size-8 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={toggleSidebar}
          aria-label={state === "collapsed" ? "توسيع القائمة" : "طي القائمة"}
        >
          {state === "collapsed" ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </SidebarHeader>
      <SidebarNav groups={groups} />
      <SidebarFooter className="p-4">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
