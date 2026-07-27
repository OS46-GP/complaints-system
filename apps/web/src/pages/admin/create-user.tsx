import { PageHeader } from "@/components/shared/page-header";
import { UserCreateForm } from "@/features/user-create/user-create-form";

export default function AdminCreateUser() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="إضافة مستخدم جديد"
        description="أدخل بيانات الموظف الجديد لتحديد صلاحيات الوصول إلى النظام."
      />

      <div className="mt-8">
        <UserCreateForm
          onSubmit={async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }}
        />
      </div>
    </div>
  );
}
