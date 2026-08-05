import { DelaysReportPage } from "@/features/reporting/delays-report";
import { PATHS } from "@/router/paths";

export default function UserDelaysReport() {
  return <DelaysReportPage basePath={PATHS.USER.REPORTS.DASHBOARD} />;
}