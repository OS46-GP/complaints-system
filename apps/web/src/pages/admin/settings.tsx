import { PageHeader } from "@/components/shared/page-header";
import { PreferencesSection } from "@/features/settings/preferences/preferences-section";
import { DelayThresholdsSection } from "@/features/settings/delay-thresholds/delay-thresholds-section";

export default function AdminSettings() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإعدادات"
        description="إدارة تفضيلاتك الشخصية وإعدادات النظام"
      />
      <DelayThresholdsSection />
      <PreferencesSection />
    </div>
  );
}
