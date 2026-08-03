import { resolveDownloadUrl } from "@/features/reporting/api";
import type { ExportResult } from "@/features/reporting/types";

export function openDownload(result: ExportResult) {
  window.open(resolveDownloadUrl(result.downloadUrl), "_blank", "noopener,noreferrer");
}
