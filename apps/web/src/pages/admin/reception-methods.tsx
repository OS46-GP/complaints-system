import { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { ReceptionMethodsList } from "@/features/reception-methods/reception-methods-list";
import { ReceptionMethodsSkeleton } from "@/features/reception-methods/reception-methods-skeleton";
import { ReceptionMethodFormDialog } from "@/features/reception-methods/reception-method-form-dialog";
import { useReceptionMethodsList } from "@/features/reception-methods/hooks";
import type { ReceptionMethod } from "@/features/reception-methods/types";

export default function AdminReceptionMethods() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") || "id";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

  const { data: methods, isLoading, isError, refetch } = useReceptionMethodsList({
    search: search || undefined,
    sortBy: sortBy || undefined,
    sortOrder,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ReceptionMethod | null>(null);

  const openCreate = () => {
    setEditingMethod(null);
    setDialogOpen(true);
  };

  const openEdit = (method: ReceptionMethod) => {
    setEditingMethod(method);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة طرق الاستلام"
        description="إدارة طرق استلام الشكاوى المستخدمة في نموذج إنشاء الشكوى"
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-5" />
          <span>إضافة طريقة استلام جديدة</span>
        </Button>
      </PageHeader>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل طرق الاستلام"
        skeleton={<ReceptionMethodsSkeleton />}
      >
        <ReceptionMethodsList methods={methods ?? []} onEdit={openEdit} />
      </AsyncLoader>

      <ReceptionMethodFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        method={editingMethod}
      />
    </div>
  );
}
