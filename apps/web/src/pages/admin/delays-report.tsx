import { DelaysReportPage } from "@/features/reporting/delays-report";
import { PATHS } from "@/router/paths";

export default function AdminDelaysReport() {
  return <DelaysReportPage basePath={PATHS.ADMIN.REPORTS.DASHBOARD} />;
}