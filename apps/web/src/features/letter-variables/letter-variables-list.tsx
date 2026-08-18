import { useState } from "react";
import { toast } from "sonner";
import {
  AlignRight,
  Calendar,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Type,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteLetterVariable } from "@/features/letter-variables/hooks";
import {
  formatLetterVariableDefaultValue,
  LETTER_VARIABLE_TYPE_BADGE_VARIANTS,
  LETTER_VARIABLE_TYPE_LABELS,
  type LetterVariable,
  type LetterVariableType,
} from "@/features/letter-variables/types";

const LETTER_VARIABLE_TYPE_ICONS: Record<LetterVariableType, LucideIcon> = {
  text: Type,
  textarea: AlignRight,
  date: Calendar,
  image: ImageIcon,
};

interface LetterVariablesListProps {
  variables: LetterVariable[];
  onEdit: (variable: LetterVariable) => void;
}

const columns: DataTableColumn[] = [
  { key: "key", label: "المفتاح" },
  { key: "labelAr", label: "الاسم الظاهر" },
  { key: "type", label: "النوع" },
  { key: "defaultValue", label: "القيمة الافتراضية" },
  { key: "isActive", label: "الحالة" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function LetterVariablesList({
  variables,
  onEdit,
}: LetterVariablesListProps) {
  if (variables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <p className="font-heading text-body-lg font-semibold text-foreground">
          لا توجد متغيرات
        </p>
        <p className="text-body-sm text-muted-foreground">
          لم يتم إضافة متغيرات عامة بعد. أضف متغيراً ليظهر في قائمة المتغيرات
          عند تحرير نماذج الخطابات.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <DataTable>
        <DataTableHeader columns={columns} />
        <DataTableBody>
          {variables.map((variable) => (
            <LetterVariableRow
              key={variable.id}
              variable={variable}
              onEdit={() => onEdit(variable)}
            />
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}

interface LetterVariableRowProps {
  variable: LetterVariable;
  onEdit: () => void;
}

function LetterVariableRow({ variable, onEdit }: LetterVariableRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="px-6 py-4">
        <span
          className="font-mono text-mono-data text-label-sm text-primary"
          dir="ltr"
        >
          {"{{"}{variable.key}{"}}"}
        </span>
      </DataTableCell>
      <DataTableCell className="px-6 py-4">
        <p className="font-heading text-body-lg font-bold text-foreground">
          {variable.labelAr}
        </p>
      </DataTableCell>
      <DataTableCell className="px-6 py-4">
        <Badge variant={LETTER_VARIABLE_TYPE_BADGE_VARIANTS[variable.type]}>
          {(() => {
            const TypeIcon = LETTER_VARIABLE_TYPE_ICONS[variable.type];
            return <TypeIcon className="size-3" />;
          })()}
          {LETTER_VARIABLE_TYPE_LABELS[variable.type]}
        </Badge>
      </DataTableCell>
      <DataTableCell className="max-w-56 px-6 py-4">
        <p className="truncate text-body-sm text-muted-foreground">
          {formatLetterVariableDefaultValue(variable)}
        </p>
      </DataTableCell>
      <DataTableCell className="px-6 py-4">
        <Badge variant={variable.isActive ? "secondary" : "outline"}>
          {variable.isActive ? "مفعّل" : "معطّل"}
        </Badge>
      </DataTableCell>
      <DataTableCell className="px-6 py-4 text-center">
        <LetterVariableActionsDropdown
          variable={variable}
          onEdit={onEdit}
        />
      </DataTableCell>
    </DataTableRow>
  );
}

interface LetterVariableActionsDropdownProps {
  variable: LetterVariable;
  onEdit: () => void;
}

function LetterVariableActionsDropdown({
  variable,
  onEdit,
}: LetterVariableActionsDropdownProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteLetterVariable();

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={onEdit} className="w-full gap-2">
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="w-full gap-2"
            disabled={variable.isSystem}
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="حذف المتغير"
        description={`هل أنت متأكد من حذف المتغير "{{${variable.key}}}"؟ لا يمكن حذف المتغيرات المستخدمة في نماذج الخطابات.`}
        confirmLabel={deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
        cancelLabel="إلغاء"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(variable.id, {
            onSuccess: () => {
              toast.success("تم حذف المتغير بنجاح");
              setDeleteOpen(false);
            },
          })
        }
      />
    </>
  );
}