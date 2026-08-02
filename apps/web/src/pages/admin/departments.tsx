import { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { DepartmentsList } from "@/features/departments/departments-list";
import { DepartmentsSkeleton } from "@/features/departments/departments-skeleton";
import { DepartmentFormDialog } from "@/features/departments/department-form-dialog";
import { useDepartmentsList } from "@/features/departments/hooks";
import type { Department } from "@/features/departments/types";

export default function AdminDepartments() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

  const { data: departments, isLoading, isError, refetch } = useDepartmentsList({
    search: search || undefined,
    sortBy: sortBy || undefined,
    sortOrder,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const openCreate = () => {
    setEditingDepartment(null);
    setDialogOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditingDepartment(department);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة الجهات المعنية"
        description="إدارة الجهات المعنية بالشكاوى المستخدمة في نموذج إنشاء الشكوى"
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-5" />
          <span>إضافة جهة جديدة</span>
        </Button>
      </PageHeader>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل الجهات المعنية"
        skeleton={<DepartmentsSkeleton />}
      >
        <DepartmentsList departments={departments ?? []} onEdit={openEdit} />
      </AsyncLoader>

      <DepartmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={editingDepartment}
      />
    </div>
  );
}
