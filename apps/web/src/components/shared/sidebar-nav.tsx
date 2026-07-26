import { type LucideIcon } from "lucide-react";
import { Link } from "react-router";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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

export function SidebarNav({ items }: { items: NavItem[] }) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarContent className="my-10">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-11 px-4 py-3 text-xs font-medium text-start",
                    item.isActive &&
                      "border-r-2 border-sidebar-primary bg-sidebar-accent text-sidebar-primary",
                  )}
                >
                  <Link to={item.url} onClick={() => setOpenMobile(false)}>
                    <item.icon
                      className={cn("size-5", item.isActive && "fill-current")}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
