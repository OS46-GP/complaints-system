import { useParams } from "react-router";
import { PageHeader } from "@/components/shared/page-header";
import { UserEditForm } from "@/features/users/user-edit-form";

export default function AdminUserDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="بيانات المستخدم"
        description="عرض بيانات المستخدم للقراءة فقط."
      />
      <div className="mt-8">
        <UserEditForm userId={id!} />
      </div>
    </div>
  );
}
