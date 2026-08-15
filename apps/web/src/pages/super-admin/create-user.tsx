import { PageHeader } from "@/components/shared/page-header";
import { UserCreateForm } from "@/features/users/user-create-form";

export default function SuperAdminCreateUser() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="إضافة مستخدم جديد"
        description="أدخل بيانات المستخدم الجديد لتحديد الدور والرقم القومي."
      />

      <div className="mt-8">
        <UserCreateForm />
      </div>
    </div>
  );
}
