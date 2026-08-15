import type { ReceptionMethod } from "@/features/reception-methods/types";
import { ReceptionMethodActionsDropdown } from "@/features/reception-methods/reception-method-actions-dropdown";

interface ReceptionMethodCardProps {
  method: ReceptionMethod;
  onEdit: () => void;
}

export function ReceptionMethodCard({ method, onEdit }: ReceptionMethodCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-[1rem] text-foreground break-all">
            {method.name}
          </h3>
          <p className="text-label-sm text-muted-foreground mt-1">
            رقم طريقة الاستلام: {method.id}
          </p>
        </div>
        <ReceptionMethodActionsDropdown
          methodId={method.id}
          methodName={method.name}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}
