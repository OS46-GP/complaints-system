import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search, FileText, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { LetterTemplateCard } from "@/features/letter-templates/letter-template-card";
import { LetterTemplateActionsDropdown } from "@/features/letter-templates/letter-template-actions-dropdown";
import { Reveal } from "@/components/shared/reveal";
import { PATHS } from "@/router/paths";
import type { LetterTemplate } from "@/features/letter-templates/types";

const columns: DataTableColumn[] = [
  { key: "name", label: "النموذج" },
  { key: "sortOrder", label: "الترتيب", className: "text-center" },
  { key: "updatedAt", label: "آخر تحديث" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function LetterTemplatesSkeleton() {
  return (
    <>
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
      <DataTable className="hidden lg:block">
        <DataTableHeader columns={columns} />
        <DataTableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <DataTableRow key={rowIndex} className="hover:bg-transparent">
              <DataTableCell className="p-0 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              </DataTableCell>
              <DataTableCell className="p-0 px-6 py-4">
                <Skeleton className="h-4 w-8 mx-auto" />
              </DataTableCell>
              <DataTableCell className="p-0 px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </DataTableCell>
              <DataTableCell className="p-0 px-6 py-4">
                <div className="flex items-center justify-center">
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </>
  );
}

interface LetterTemplatesListProps {
  templates: LetterTemplate[];
  onEdit: (template: LetterTemplate) => void;
}

export function LetterTemplatesList({
  templates,
  onEdit,
}: LetterTemplatesListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const [draft, setDraft] = useState(search);

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.name.includes(search) ||
      (t.description ?? "").includes(search),
  );

  const handleSearch = () => {
    setSearchParams((prev) => {
      if (draft) prev.set("search", draft);
      else prev.delete("search");
      return prev;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <Input
          dir="rtl"
          placeholder="بحث في نماذج الخطابات..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" className="gap-2">
          <Search className="size-4" />
          بحث
        </Button>
      </form>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl py-14 flex flex-col items-center gap-3 text-center">
          <FileText className="size-10 text-muted-foreground" />
          <p className="text-label-base text-muted-foreground font-medium">
            {search ? "لا توجد نتائج مطابقة للبحث" : "لا توجد نماذج خطابات بعد"}
          </p>
          <p className="text-label-sm text-muted-foreground">
            أنشئ نموذجاً جديداً ليتمكن المستخدمون من إصدار خطابات للشكاوى.
          </p>
        </div>
      ) : (
        <>
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((template, index) => (
              <Reveal key={template.id} delay={index * 90}>
                <LetterTemplateCard
                  template={template}
                  onEdit={() => onEdit(template)}
                />
              </Reveal>
            ))}
          </div>

          <DataTable className="hidden lg:block">
            <DataTableHeader columns={columns} />
            <DataTableBody>
              {filtered.map((template) => (
                <LetterTemplateRow
                  key={template.id}
                  template={template}
                  onEdit={() => onEdit(template)}
                />
              ))}
            </DataTableBody>
          </DataTable>
        </>
      )}
    </div>
  );
}

interface LetterTemplateRowProps {
  template: LetterTemplate;
  onEdit: () => void;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ar-SA");
}

function LetterTemplateRow({ template, onEdit }: LetterTemplateRowProps) {
  const navigate = useNavigate();

  return (
    <DataTableRow
      className="group hover:bg-surface-container-low transition-colors cursor-pointer"
      onClick={() => navigate(PATHS.ADMIN.LETTER_TEMPLATE_EDIT(template.id))}
    >
      <DataTableCell className="p-0 px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-heading text-body-lg font-bold text-foreground truncate">
                {template.name}
              </p>
              {template.isDefault && (
                <Badge variant="secondary" className="gap-1 shrink-0">
                  <ShieldCheck className="size-3" />
                  افتراضي
                </Badge>
              )}
            </div>
          </div>
        </div>
        {template.description && (
          <p className="text-label-sm text-muted-foreground mt-1 line-clamp-1 max-w-xl">
            {template.description}
          </p>
        )}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center font-mono text-mono-data text-muted-foreground">
        {template.sortOrder}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {formatDate(template.updatedAt)}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        <LetterTemplateActionsDropdown template={template} onEdit={onEdit} />
      </DataTableCell>
    </DataTableRow>
  );
}