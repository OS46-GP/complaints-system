import { MemoGenerator } from "@/features/reporting/memo-generator";
import { PATHS } from "@/router/paths";

export default function UserMemo() {
  return <MemoGenerator basePath={PATHS.USER.REPORTS.DASHBOARD} />;
}
