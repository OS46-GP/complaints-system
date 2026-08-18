import { ReportsHub } from "@/features/reporting/reports-hub";
import { PATHS } from "@/router/paths";

export default function UserReportsDashboard() {
  return <ReportsHub basePath={PATHS.USER.REPORTS.DASHBOARD} />;
}
