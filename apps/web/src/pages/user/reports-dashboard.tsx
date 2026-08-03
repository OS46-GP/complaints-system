import { ReportingDashboard } from "@/features/reporting/reporting-dashboard";
import { PATHS } from "@/router/paths";

export default function UserReportsDashboard() {
  return <ReportingDashboard basePath={PATHS.USER.REPORTS.DASHBOARD} />;
}
