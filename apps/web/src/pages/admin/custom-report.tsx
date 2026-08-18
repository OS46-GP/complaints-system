import { CustomReportBuilder } from "@/features/reporting/custom-report-builder";
import { PATHS } from "@/router/paths";

export default function AdminCustomReport() {
  return <CustomReportBuilder basePath={PATHS.ADMIN.REPORTS.DASHBOARD} />;
}
