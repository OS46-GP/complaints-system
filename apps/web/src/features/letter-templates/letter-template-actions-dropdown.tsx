import { useState } from "react";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useDeleteLetterTemplate,
  usePreviewLetterTemplate,
} from "@/features/letter-templates/hooks";
import type { LetterTemplate } from "@/features/letter-templates/types";

interface LetterTemplateActionsDropdownProps {
  template: LetterTemplate;
  onEdit: () => void;
}

export function LetterTemplateActionsDropdown({
  template,
  onEdit,
}: LetterTemplateActionsDropdownProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteLetterTemplate();
  const previewMutation = usePreviewLetterTemplate();
  const isPending = deleteMutation.isPending || previewMutation.isPending;

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            onClick={() => previewMutation.mutate(template.id)}
            disabled={isPending}
            className="w-full gap-2"
          >
            <Eye className="size-4" />
            {previewMutation.isPending ? "جارٍ المعاينة..." : "معاينة"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit} className="w-full gap-2">
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="w-full gap-2"
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="حذف نموذج الخطاب"
        description={`هل أنت متأكد من حذف "${template.name}"؟ لا يمكن حذف النماذج المستخدمة في خطابات صادرة.`}
        confirmLabel={deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
        cancelLabel="إلغاء"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(template.id, {
            onSuccess: () => setDeleteOpen(false),
          })
        }
      />
    </>
  );
}