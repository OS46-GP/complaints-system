import { PageHeader } from "@/components/shared/page-header";
import { PreferencesSection } from "@/features/settings/preferences/preferences-section";

export default function SuperAdminSettings() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإعدادات"
        description="إدارة تفضيلاتك الشخصية"
      />
      <PreferencesSection />
    </div>
  );
}
