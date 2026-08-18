import { type LucideIcon, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { LogoutButton } from "@/features/auth/logout-button";

export interface UserNavItem {
  label: string;
  icon?: LucideIcon;
  path: string;
}

export interface UserNavProps {
  name: string;
  role: string;
  className?: string;
  items?: UserNavItem[];
}

export function UserNav({
  name,
  role,
  className,
  items,
}: UserNavProps) {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <div
          className={cn("flex cursor-pointer items-center gap-3", className)}
        >
          <div className="hidden md:block">
            <p className="text-xs font-bold text-foreground">{name}</p>
            <p className="text-[0.625rem] text-muted-foreground">{role}</p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full border-2 border-sidebar-primary bg-sidebar-accent md:size-10">
            <User className="size-4 text-sidebar-primary md:size-5" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="md:hidden font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </DropdownMenuLabel>
        {items && items.length > 0 && (
          <>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuGroup>
              {items.map((item) => (
                <DropdownMenuItem asChild key={item.label} variant="default">
                  <Link to={item.path}>
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <LogoutButton className="w-full justify-start" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
