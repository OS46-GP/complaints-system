import { CustomReportBuilder } from "@/features/reporting/custom-report-builder";
import { PATHS } from "@/router/paths";

export default function UserCustomReport() {
  return <CustomReportBuilder basePath={PATHS.USER.REPORTS.DASHBOARD} />;
}
