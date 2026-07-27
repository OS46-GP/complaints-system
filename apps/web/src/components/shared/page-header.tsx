import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="font-heading text-display-lg text-foreground mb-1">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground font-body text-body-md">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button className="gap-2" onClick={action.onClick}>
          <action.icon className="size-5" />
          <span>{action.label}</span>
        </Button>
      )}
    </div>
  );
}
