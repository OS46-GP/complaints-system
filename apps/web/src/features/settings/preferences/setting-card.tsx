import type { ComponentType, ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  /** Extend the card across the responsive settings grid. */
  className?: string;
}

export function SettingCard({
  icon: Icon,
  title,
  children,
  className,
}: SettingCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
