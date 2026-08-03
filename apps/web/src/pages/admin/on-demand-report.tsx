import { OnDemandReport } from "@/features/reporting/on-demand-report";
import { PATHS } from "@/router/paths";

export default function AdminOnDemandReport() {
  return <OnDemandReport basePath={PATHS.ADMIN.REPORTS.DASHBOARD} />;
}
