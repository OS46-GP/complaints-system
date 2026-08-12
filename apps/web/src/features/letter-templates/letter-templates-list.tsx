import { useState } from "react";
import { useSearchParams } from "react-router";
import { Search, FileText } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LetterTemplateCard } from "@/features/letter-templates/letter-template-card";
import type { LetterTemplate } from "@/features/letter-templates/types";

export function LetterTemplatesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-xl" />
      ))}
    </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <LetterTemplateCard
              key={template.id}
              template={template}
              onEdit={() => onEdit(template)}
            />
          ))}
        </div>
      )}
    </div>
  );
}