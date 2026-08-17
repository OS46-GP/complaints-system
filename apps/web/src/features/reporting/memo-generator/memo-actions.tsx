import { Eye, FileStack, Loader2, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEGACY_MEMO_TEMPLATE } from "./constants";
import type { ApiComplaint } from "@/features/complaint-list/types";
import type { LetterTemplate } from "@/features/letter-templates/types";

interface MemoActionsProps {
  complaint: ApiComplaint;
  templates: LetterTemplate[];
  templatesLoading: boolean;
  templateValue: string;
  templateLabel: string;
  onTemplateChange: (value: string) => void;
  generating: boolean;
  onGenerate: (mode: "download" | "preview") => void;
  padded?: boolean;
}

export function MemoActions({
  complaint,
  templates,
  templatesLoading,
  templateValue,
  templateLabel,
  onTemplateChange,
  generating,
  onGenerate,
  padded = true,
}: MemoActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        padded && "px-6 py-4",
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 font-heading text-label-sm text-muted-foreground">
            <FileStack className="size-4" />
            نوع الخطاب
          </span>
          <Select
            value={templateValue}
            onValueChange={onTemplateChange}
            disabled={templatesLoading}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="اختر نوع الخطاب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LEGACY_MEMO_TEMPLATE}>
                المذكرة الرسمية الحالية
              </SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => onGenerate("download")}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            تنزيل PDF
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={() => onGenerate("preview")}
            disabled={generating}
          >
            <Eye className="size-4" />
            معاينة قبل الطباعة
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-6 border-b border-border pb-4 text-center">
          <p className="font-heading text-title-md text-foreground">
            محافظة المنوفية
          </p>
          <p className="font-heading text-label-sm text-muted-foreground">
            {templateLabel}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MemoField
            label="رقم الشكوى"
            value={`#${complaint.complaintNumber}-${complaint.statementYear}`}
          />
          <MemoField
            label="تاريخ الوصول"
            value={new Date(complaint.arrivalDate).toLocaleDateString("ar-EG")}
          />
          <MemoField
            label="اسم المواطن"
            value={complaint.citizen.fullName}
          />
          <MemoField
            label="الجهة المختصة"
            value={complaint.department?.name ?? "غير محدد"}
          />
          <div className="md:col-span-2">
            <MemoField label="موضوع الشكوى" value={complaint.subject} />
          </div>
        </dl>

        <p className="mt-6 text-label-sm text-muted-foreground">
          اضغط «معاينة قبل الطباعة» لعرض الخطاب الفعلي قبل طباعته، أو «تنزيل
          PDF» لتنزيله مباشرة وفق القالب المختار.
        </p>
      </div>
    </div>
  );
}

function MemoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-heading text-label-sm text-muted-foreground">
        {label}
      </dt>
      <dd className="font-heading text-label-sm font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}