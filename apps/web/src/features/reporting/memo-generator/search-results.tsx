import { Inbox } from "lucide-react";

import { MemoResultRow } from "./result-row";
import type { ApiComplaint } from "@/features/complaint-list/types";
import type { LetterTemplate } from "@/features/letter-templates/types";

interface MemoSearchResultsProps {
  searched: boolean;
  searching: boolean;
  results: ApiComplaint[];
  selected: ApiComplaint | null;
  onSelect: (complaint: ApiComplaint) => void;
  templates: LetterTemplate[];
  templatesLoading: boolean;
  templateValue: string;
  templateLabel: string;
  onTemplateChange: (value: string) => void;
  generating: boolean;
  onGenerate: (mode: "download" | "preview") => void;
}

export function MemoSearchResults({
  searched,
  searching,
  results,
  selected,
  onSelect,
  templates,
  templatesLoading,
  templateValue,
  templateLabel,
  onTemplateChange,
  generating,
  onGenerate,
}: MemoSearchResultsProps) {
  if (!searched || searching) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading text-title-sm text-foreground">
        نتائج البحث
      </h2>
      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
          <Inbox className="size-8 text-muted-foreground/40" />
          <p className="text-body-sm text-muted-foreground">
            لا توجد شكاوى مطابقة للبحث
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-container-lowest">
          {results.map((complaint) => (
            <li key={complaint.id}>
              <MemoResultRow
                complaint={complaint}
                isSelected={selected?.id === complaint.id}
                onSelect={onSelect}
                templates={templates}
                templatesLoading={templatesLoading}
                templateValue={templateValue}
                templateLabel={templateLabel}
                onTemplateChange={onTemplateChange}
                generating={generating}
                onGenerate={onGenerate}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}