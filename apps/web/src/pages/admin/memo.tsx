import { MemoGenerator } from "@/features/reporting/memo-generator";
import { PATHS } from "@/router/paths";

export default function AdminMemo() {
  return <MemoGenerator basePath={PATHS.ADMIN.REPORTS.DASHBOARD} />;
}
