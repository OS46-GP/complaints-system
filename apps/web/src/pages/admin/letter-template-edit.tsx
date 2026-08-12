import { useParams } from "react-router";

import { AsyncLoader } from "@/components/shared/async-loader";
import { LetterTemplateForm } from "@/features/letter-templates/letter-template-form";
import { useLetterTemplate } from "@/features/letter-templates/hooks";

export default function AdminLetterTemplateEdit() {
  const { id } = useParams();
  const { data: template, isLoading, isError, refetch } = useLetterTemplate(id);

  return (
    <AsyncLoader
      loading={isLoading}
      error={isError}
      onRetry={() => refetch()}
      errorText="تعذر تحميل نموذج الخطاب"
    >
      {template ? <LetterTemplateForm template={template} /> : null}
    </AsyncLoader>
  );
}