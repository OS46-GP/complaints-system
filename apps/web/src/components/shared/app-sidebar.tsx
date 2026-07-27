import { type LucideIcon } from "lucide-react";

import { Sidebar, SidebarFooter } from "@/components/ui/sidebar";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { SidebarNav, type NavItem } from "@/components/shared/sidebar-nav";
import { LogoutButton } from "@/features/auth/logout-button";

export type { NavItem };

export function AppSidebar({
  items,
  brand,
}: {
  items: NavItem[];
  brand: { title: string; subtitle: string; icon: LucideIcon };
}) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" side="right">
      <SidebarBrand
        icon={brand.icon}
        title={brand.title}
        subtitle={brand.subtitle}
      />
      <SidebarNav items={items} />
      <SidebarFooter className="p-4">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
