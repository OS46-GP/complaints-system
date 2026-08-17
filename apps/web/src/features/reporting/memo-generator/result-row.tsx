import { cn } from "@/lib/utils";
import { MemoActions } from "./memo-actions";
import type { ApiComplaint } from "@/features/complaint-list/types";
import type { LetterTemplate } from "@/features/letter-templates/types";

interface MemoResultRowProps {
  complaint: ApiComplaint;
  isSelected: boolean;
  onSelect: (complaint: ApiComplaint) => void;
  templates: LetterTemplate[];
  templatesLoading: boolean;
  templateValue: string;
  templateLabel: string;
  onTemplateChange: (value: string) => void;
  generating: boolean;
  onGenerate: (mode: "download" | "preview") => void;
}

export function MemoResultRow({
  complaint,
  isSelected,
  onSelect,
  ...actions
}: MemoResultRowProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(complaint)}
        className={cn(
          "flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-start transition-colors",
          isSelected && "bg-primary/5",
        )}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="font-heading text-label-sm font-semibold text-foreground truncate">
            {complaint.subject || "بدون موضوع"}
          </span>
          <span className="text-label-sm text-muted-foreground">
            {complaint.citizen.fullName} ·{" "}
            {complaint.department?.name ?? "غير محدد"}
          </span>
        </span>
        <span
          dir="ltr"
          className="font-mono text-mono-data text-muted-foreground"
        >
          #{complaint.complaintNumber}-{complaint.statementYear}
        </span>
      </button>
      {isSelected && (
        <div className="border-t border-border">
          <MemoActions complaint={complaint} {...actions} />
        </div>
      )}
    </>
  );
}