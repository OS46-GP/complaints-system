import { useParams } from "react-router";
import { PageHeader } from "@/components/shared/page-header";
import { UserEditForm } from "@/features/users/user-edit-form";

export default function SuperAdminUserDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="تعديل المستخدم"
        description="عرض بيانات المستخدم وتعديل دوره في النظام."
      />
      <div className="mt-8">
        <UserEditForm userId={id!} />
      </div>
    </div>
  );
}
