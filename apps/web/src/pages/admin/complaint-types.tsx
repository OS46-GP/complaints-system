import { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { ComplaintTypesList } from "@/features/complaint-types/complaint-types-list";
import { ComplaintTypesSkeleton } from "@/features/complaint-types/complaint-types-skeleton";
import { ComplaintTypeFormDialog } from "@/features/complaint-types/complaint-type-form-dialog";
import { useComplaintTypesList } from "@/features/complaint-types/hooks";
import type { ComplaintType } from "@/features/complaint-types/types";

export default function AdminComplaintTypes() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") || "id";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

  const { data: types, isLoading, isError, refetch } = useComplaintTypesList({
    search: search || undefined,
    sortBy: sortBy || undefined,
    sortOrder,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ComplaintType | null>(null);

  const openCreate = () => {
    setEditingType(null);
    setDialogOpen(true);
  };

  const openEdit = (type: ComplaintType) => {
    setEditingType(type);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة الفئات"
        description="إدارة فئات الشكاوى المستخدمة في نموذج إنشاء الشكوى"
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-5" />
          <span>إضافة فئة جديدة</span>
        </Button>
      </PageHeader>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل الفئات"
        skeleton={<ComplaintTypesSkeleton />}
      >
        <ComplaintTypesList types={types ?? []} onEdit={openEdit} />
      </AsyncLoader>

      <ComplaintTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={editingType}
      />
    </div>
  );
}
