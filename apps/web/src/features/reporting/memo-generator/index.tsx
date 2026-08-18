import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { openDownload } from "@/features/reporting/download";
import { useGenerateMemo } from "@/features/reporting/hooks";
import { resolveDownloadUrl } from "@/features/reporting/api";
import { complaintsApi } from "@/features/complaint-list/api";
import { LetterPreviewDialog } from "@/features/letter-templates/letter-preview-dialog";
import {
  useActiveLetterTemplates,
  useGenerateLetter,
} from "@/features/letter-templates/hooks";
import { MemoSearchBar } from "./search-bar";
import { MemoSearchResults } from "./search-results";
import { MemoActions } from "./memo-actions";
import { LEGACY_MEMO_TEMPLATE } from "./constants";
import type { ApiComplaint } from "@/features/complaint-list/types";

interface MemoGeneratorProps {
  basePath: string;
}

interface PreviewState {
  url: string;
  title: string;
}

export function MemoGenerator({ basePath }: MemoGeneratorProps) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ApiComplaint[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<ApiComplaint | null>(null);
  const [templateValue, setTemplateValue] =
    useState<string>(LEGACY_MEMO_TEMPLATE);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const { data: templates, isLoading: templatesLoading } =
    useActiveLetterTemplates();
  const memoMutation = useGenerateMemo();
  const letterMutation = useGenerateLetter(selected?.id ?? "");

  const generating = memoMutation.isPending || letterMutation.isPending;

  const selectedTemplate = templates?.find((t) => t.id === templateValue);

  const templateLabel =
    templateValue === LEGACY_MEMO_TEMPLATE
      ? "المذكرة الرسمية الحالية"
      : (selectedTemplate?.name ?? "الخطاب");

  const selectedNotVisible =
    !!selected && !results.some((r) => r.id === selected.id);

  const handleSearch = async (value: string) => {
    if (!value.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await complaintsApi.list({ name: value.trim(), limit: 10 });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (complaint: ApiComplaint) => {
    setSelected((current) => (current?.id === complaint.id ? null : complaint));
  };

  const handleGenerate = (mode: "download" | "preview") => {
    if (!selected) return;

    const onResult = (result: {
      downloadUrl: string;
      filename: string;
      mime: string;
    }) => {
      const url = resolveDownloadUrl(result.downloadUrl);
      if (mode === "download") {
        openDownload(result);
      } else {
        setPreview({ url, title: templateLabel });
      }
    };

    if (templateValue === LEGACY_MEMO_TEMPLATE) {
      memoMutation.mutate(selected.id, { onSuccess: onResult });
    } else {
      letterMutation.mutate(
        { templateId: templateValue },
        { onSuccess: onResult },
      );
    }
  };

  const actionProps = {
    templates: templates ?? [],
    templatesLoading,
    templateValue,
    templateLabel,
    onTemplateChange: setTemplateValue,
    generating,
    onGenerate: handleGenerate,
  };

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="توليد خطاب / مذكرة"
        description="اختر شكوى ثم حدد نوع الخطاب، واطّلع على المعاينة قبل الطباعة"
      />

      <MemoSearchBar
        value={search}
        onChange={setSearch}
        onSubmit={handleSearch}
        searching={searching}
      />

      <MemoSearchResults
        searched={searched}
        searching={searching}
        results={results}
        selected={selected}
        onSelect={handleSelect}
        {...actionProps}
      />

      {selectedNotVisible && !searching && selected && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="font-heading text-title-sm text-foreground">
              الشكوى المحددة
            </h2>
            <MemoActions complaint={selected} {...actionProps} padded={false} />
          </CardContent>
        </Card>
      )}

      <LetterPreviewDialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        url={preview?.url ?? null}
        title={preview?.title}
      />
    </div>
  );
}