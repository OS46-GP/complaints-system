import { ScheduledReports } from "@/features/reporting/scheduled-reports";
import { PATHS } from "@/router/paths";

export default function UserScheduledReports() {
  return <ScheduledReports basePath={PATHS.USER.REPORTS.DASHBOARD} />;
}
