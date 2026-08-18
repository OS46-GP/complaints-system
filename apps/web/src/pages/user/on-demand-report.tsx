import { OnDemandReport } from "@/features/reporting/on-demand-report";
import { PATHS } from "@/router/paths";

export default function UserOnDemandReport() {
  return <OnDemandReport basePath={PATHS.USER.REPORTS.DASHBOARD} />;
}
