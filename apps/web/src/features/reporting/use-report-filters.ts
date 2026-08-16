import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import type { ReportFilters } from "@/features/reporting/types";

export function useReportFilters(defaults?: Partial<ReportFilters>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ReportFilters>(() => {
    const merged: ReportFilters = { ...defaults };

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const department = searchParams.get("department");
    const village = searchParams.get("village");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("order");

    if (from) merged.from = from;
    if (to) merged.to = to;
    if (department) merged.department = department;
    if (village) merged.village = village;
    if (status === "FINISHED" || status === "NOT_FINISHED") {
      merged.status = status;
    }
    if (severity === "Low" || severity === "Medium" || severity === "High") {
      merged.severity = severity;
    }
    if (sortBy === "overdueCount" || sortBy === "avgDaysOverdue") {
      merged.sortBy = sortBy;
    }
    if (order === "asc" || order === "desc") {
      merged.sortOrder = order;
    }
    return merged;
  }, [searchParams, defaults]);

  const setFilters = useCallback(
    (patch: Partial<ReportFilters>) => {
      const next = new URLSearchParams(searchParams);
      if (patch.from === undefined || patch.from === "" || patch.from === null) {
        next.delete("from");
      } else {
        next.set("from", patch.from);
      }
      if (patch.to === undefined || patch.to === "" || patch.to === null) {
        next.delete("to");
      } else {
        next.set("to", patch.to);
      }
      if (
        patch.department === undefined ||
        patch.department === "" ||
        patch.department === null
      ) {
        next.delete("department");
      } else {
        next.set("department", patch.department);
      }
      if (patch.village === undefined || patch.village === "" || patch.village === null) {
        next.delete("village");
      } else {
        next.set("village", patch.village);
      }
      if (patch.status === undefined || patch.status === null) {
        next.delete("status");
      } else {
        next.set("status", patch.status);
      }
      if (patch.severity === undefined || patch.severity === null) {
        next.delete("severity");
      } else {
        next.set("severity", patch.severity);
      }
      if (patch.sortBy === undefined || patch.sortBy === null) {
        next.delete("sortBy");
      } else {
        next.set("sortBy", patch.sortBy);
      }
      if (patch.sortOrder === undefined || patch.sortOrder === null) {
        next.delete("order");
      } else {
        next.set("order", patch.sortOrder);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return { filters, setFilters, reset };
}