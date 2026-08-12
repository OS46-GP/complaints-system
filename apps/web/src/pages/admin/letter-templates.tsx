import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/router/paths";
import { useLetterTemplates } from "@/features/letter-templates/hooks";
import { LetterTemplatesList } from "@/features/letter-templates/letter-templates-list";
import { LetterTemplatesSkeleton } from "@/features/letter-templates/letter-templates-list";
import type { LetterTemplate } from "@/features/letter-templates/types";

export default function AdminLetterTemplates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const { data: templates, isLoading, isError, refetch } = useLetterTemplates({
    search: search || undefined,
    sortBy: "sortOrder",
  });

  const openEdit = (template: LetterTemplate) => {
    navigate(PATHS.ADMIN.LETTER_TEMPLATE_EDIT(template.id));
  };

  const stats = useMemo(
    () => ({
      total: templates?.length ?? 0,
      active: templates?.filter((t) => t.isActive).length ?? 0,
    }),
    [templates],
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="نماذج الخطابات"
        description="إنشاء وإدارة نماذج الخطابات التي يستخدمها الموظفون عند إصدار خطابات للشكاوى"
      >
        <Button
          className="gap-2"
          onClick={() => navigate(PATHS.ADMIN.LETTER_TEMPLATE_NEW)}
        >
          <Plus className="size-5" />
          <span>إنشاء نموذج جديد</span>
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3 text-label-sm">
        <span className="text-muted-foreground">
          الإجمالي: <b className="text-foreground">{stats.total}</b>
        </span>
        <span className="text-muted-foreground">
          المفعّلة: <b className="text-primary">{stats.active}</b>
        </span>
      </div>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل نماذج الخطابات"
        skeleton={<LetterTemplatesSkeleton />}
      >
        <LetterTemplatesList templates={templates ?? []} onEdit={openEdit} />
      </AsyncLoader>
    </div>
  );
}