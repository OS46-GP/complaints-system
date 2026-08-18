import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { useLetterVariables } from "@/features/letter-variables/hooks";
import { LetterVariablesList } from "@/features/letter-variables/letter-variables-list";
import { LetterVariableFormDialog } from "@/features/letter-variables/letter-variable-form-dialog";
import { LetterVariablesSkeleton } from "@/features/letter-variables/letter-variables-skeleton";
import type { LetterVariable } from "@/features/letter-variables/types";

export default function AdminLetterVariables() {
  const { data: variables, isLoading, isError, refetch } = useLetterVariables();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<LetterVariable | null>(
    null,
  );

  const openCreate = () => {
    setEditingVariable(null);
    setDialogOpen(true);
  };

  const openEdit = (variable: LetterVariable) => {
    setEditingVariable(variable);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="متغيرات الخطابات"
        description="إدارة المتغيرات العامة المستخدمة في نماذج الخطابات — تُستبدل تلقائياً ببيانات الشكوى أو بقيمتها الافتراضية عند الإصدار"
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-5" />
          <span>إضافة متغير جديد</span>
        </Button>
      </PageHeader>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل المتغيرات"
        skeleton={<LetterVariablesSkeleton />}
      >
        <LetterVariablesList
          variables={variables ?? []}
          onEdit={openEdit}
        />
      </AsyncLoader>

      <LetterVariableFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variable={editingVariable}
      />
    </div>
  );
}