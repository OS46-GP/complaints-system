import { type LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  src?: string;
  fallback?: string;
  className?: string;
  items?: UserNavItem[];
}

export function UserNav({
  name,
  role,
  src,
  fallback,
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
            <p className="text-[10px] text-muted-foreground">{role}</p>
          </div>
          <Avatar className="size-8 border-2 border-sidebar-primary md:size-10">
            <AvatarImage src={src} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
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
