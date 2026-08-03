import { ScheduledReports } from "@/features/reporting/scheduled-reports";
import { PATHS } from "@/router/paths";

export default function AdminScheduledReports() {
  return <ScheduledReports basePath={PATHS.ADMIN.REPORTS.DASHBOARD} />;
}
