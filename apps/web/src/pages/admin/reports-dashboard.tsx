import { ReportingDashboard } from "@/features/reporting/reporting-dashboard";
import { PATHS } from "@/router/paths";

export default function AdminReportsDashboard() {
  return <ReportingDashboard basePath={PATHS.ADMIN.REPORTS.DASHBOARD} />;
}
