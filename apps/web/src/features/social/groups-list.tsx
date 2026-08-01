import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToggleGroup, useRemoveGroup } from "@/features/social/hooks";
import type { MonitoredGroup } from "@/features/social/types";

interface GroupsListProps {
  groups: MonitoredGroup[];
}

export function GroupsList({ groups }: GroupsListProps) {
  const toggleMutation = useToggleGroup();
  const removeMutation = useRemoveGroup();
  const [groupToRemove, setGroupToRemove] = useState<MonitoredGroup | null>(null);

  const handleToggle = (group: MonitoredGroup, isActive: boolean) => {
    toggleMutation.mutate(
      { id: group.id, isActive },
      {
        onError: () => toast.error("تعذر تحديث حالة المجموعة"),
      },
    );
  };

  const handleRemove = () => {
    if (!groupToRemove) return;
    removeMutation.mutate(groupToRemove.id, {
      onSuccess: () => {
        toast.success("تمت إزالة المجموعة");
        setGroupToRemove(null);
      },
      onError: () => toast.error("تعذر إزالة المجموعة"),
    });
  };

  return (
    <>
      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-container-lowest">
        {groups.map((group) => (
          <li
            key={group.id}
            className="flex items-center justify-between gap-4 px-6 py-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <a
                  href={
                    group.type === "Page"
                      ? `https://www.facebook.com/${group.groupId}`
                      : `https://www.facebook.com/groups/${group.groupId}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading font-semibold text-foreground truncate hover:text-primary hover:underline"
                >
                  {group.name}
                </a>
                <Badge variant={group.type === "Page" ? "secondary" : "outline"}>
                  {group.type === "Page" ? "صفحة" : "مجموعة"}
                </Badge>
              </div>
              <span
                dir="ltr"
                className="text-body-sm text-muted-foreground text-start"
              >
                {group.groupId}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Switch
                checked={group.isActive}
                disabled={toggleMutation.isPending}
                onCheckedChange={(checked) => handleToggle(group, checked)}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setGroupToRemove(group)}
                aria-label={`إزالة ${group.name}`}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!groupToRemove}
        onOpenChange={(open) => !open && setGroupToRemove(null)}
        title="إزالة المجموعة"
        description={`هل أنت متأكد من إزالة "${groupToRemove?.name}" من قائمة المراقبة؟`}
        confirmLabel="إزالة"
        variant="destructive"
        loading={removeMutation.isPending}
        onConfirm={handleRemove}
      />
    </>
  );
}
