import { useState } from "react";
import { Search, FileText, Download, Loader2, Inbox } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { openDownload } from "@/features/reporting/download";
import { useGenerateMemo } from "@/features/reporting/hooks";
import { complaintsApi } from "@/features/complaint-list/api";
import type { ApiComplaint } from "@/features/complaint-list/types";
import { cn } from "@/lib/utils";

interface MemoGeneratorProps {
  basePath: string;
}

export function MemoGenerator({ basePath }: MemoGeneratorProps) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ApiComplaint[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<ApiComplaint | null>(null);

  const memoMutation = useGenerateMemo();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await complaintsApi.list({ name: search.trim(), limit: 10 });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (complaint: ApiComplaint) => {
    setSelected(complaint);
  };

  const handleDownload = () => {
    if (!selected) return;
    memoMutation.mutate(selected.id, {
      onSuccess: (result) => openDownload(result),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="توليد خطاب / مذكرة"
        description="اختر شكوى لتوليد خطاب رسمي للجهة المختصة وتنزيله بصيغة PDF"
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم المواطن أو رقم الشكوى..."
                className="ps-9"
              />
            </div>
            <Button type="submit" className="gap-2" disabled={searching || !search.trim()}>
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              بحث
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && !searching && (
        <div className="flex flex-col gap-2">
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
              {results.map((complaint) => {
                const isSelected = selected?.id === complaint.id;
                return (
                  <li key={complaint.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(complaint)}
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {selected && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 font-heading text-title-sm text-foreground">
                <FileText className="size-5 text-primary" />
                معاينة المذكرة
              </h2>
              <Button
                type="button"
                className="gap-2"
                onClick={handleDownload}
                disabled={memoMutation.isPending}
              >
                {memoMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                تنزيل PDF
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-surface-container-lowest p-6">
              <div className="mb-6 border-b border-border pb-4 text-center">
                <p className="font-heading text-title-md text-foreground">
                  محافظة المنوفية
                </p>
                <p className="font-heading text-label-sm text-muted-foreground">
                  خطاب بخصوص شكوى
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <MemoField label="رقم الشكوى" value={`#${selected.complaintNumber}-${selected.statementYear}`} />
                <MemoField
                  label="تاريخ الوصول"
                  value={new Date(selected.arrivalDate).toLocaleDateString("ar-EG")}
                />
                <MemoField label="اسم المواطن" value={selected.citizen.fullName} />
                <MemoField
                  label="الجهة المختصة"
                  value={selected.department?.name ?? "غير محدد"}
                />
                <div className="md:col-span-2">
                  <MemoField label="موضوع الشكوى" value={selected.subject} />
                </div>
              </dl>

              <p className="mt-6 text-label-sm text-muted-foreground">
                مضمون المذكرة والترويسة الرسمية قيد الاعتماد النهائي — تُنشأ
                المذكرة الفعلية بضغط «تنزيل PDF» وفق القالب المعتمد في النظام.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MemoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-heading text-label-sm text-muted-foreground">{label}</dt>
      <dd className="font-heading text-label-sm font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}
