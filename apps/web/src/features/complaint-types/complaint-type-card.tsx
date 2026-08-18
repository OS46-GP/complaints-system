import type { ComplaintType } from "@/features/complaint-types/types";
import { ComplaintTypeActionsDropdown } from "@/features/complaint-types/complaint-type-actions-dropdown";

interface ComplaintTypeCardProps {
  type: ComplaintType;
  onEdit: () => void;
}

export function ComplaintTypeCard({ type, onEdit }: ComplaintTypeCardProps) {
  return (
    <div className="h-full bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-[1rem] text-foreground break-all">
            {type.name}
          </h3>
          <p className="text-label-sm text-muted-foreground mt-1">
            رقم الفئة: {type.id}
          </p>
        </div>
        <ComplaintTypeActionsDropdown
          typeId={type.id}
          typeName={type.name}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}
