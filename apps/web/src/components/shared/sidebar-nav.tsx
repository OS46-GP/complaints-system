import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();

  const isItemActive = (item: NavItem) =>
    item.isActive ?? (item.url !== "#" && pathname.startsWith(item.url));

  return (
    <SidebarContent className="my-10">
      {groups.map((group, index) => (
        <SidebarGroup key={group.label ?? index}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = isItemActive(item);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-11 px-4 py-3 text-xs font-medium text-start rounded-md transition-colors duration-200",
                        "hover:bg-transparent! active:bg-transparent! data-open:hover:bg-transparent! data-active:bg-transparent! hover:text-sidebar-foreground data-active:text-sidebar-accent-foreground",
                        isActive &&
                          "border-r-2 border-sidebar-primary bg-sidebar-accent text-sidebar-primary hover:bg-sidebar-accent! active:bg-sidebar-accent! data-active:bg-sidebar-accent! data-active:text-sidebar-accent-foreground!",
                      )}
                    >
                      <Link
                        to={item.url}
                        onClick={() => setOpenMobile(false)}
                        className="transition-transform duration-200"
                      >
                        <item.icon className="size-5 transition-transform duration-200 group-hover/menu-button:scale-110" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
