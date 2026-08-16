import { ReportsHub } from "@/features/reporting/reports-hub";
import { PATHS } from "@/router/paths";

export default function AdminReportsDashboard() {
  return <ReportsHub basePath={PATHS.ADMIN.REPORTS.DASHBOARD} />;
}
