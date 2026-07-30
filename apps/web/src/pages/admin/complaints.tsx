import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { NewComplaintButton } from "@/features/complaint-list/new-complaint-button";
import { ComplaintList } from "@/features/complaint-list/complaint-list";
import { complaintsApi } from "@/features/complaint-list/api";
import { mapApiComplaint } from "@/features/complaint-list/types";

const PAGE_SIZE = 10;

export default function AdminComplaints() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const departmentId = searchParams.get("departmentId") ?? "";
  const severity = searchParams.get("severity") ?? "";
  const complaintTypeId = searchParams.get("complaintTypeId") ?? "";
  const examinationStatusId = searchParams.get("examinationStatusId") ?? "";
  const receptionMethodId = searchParams.get("receptionMethodId") ?? "";
  const presentationStatusId = searchParams.get("presentationStatusId") ?? "";
  const complaintNumber = searchParams.get("complaintNumber") ?? "";
  const statementYear = searchParams.get("statementYear") ?? "";
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;

  const { data: response, isLoading } = useQuery({
    queryKey: ["complaints", search, page, departmentId, severity, complaintTypeId, examinationStatusId, receptionMethodId, presentationStatusId, complaintNumber, statementYear, sortBy, sortOrder],
    queryFn: () =>
      complaintsApi.list({
        name: search || undefined,
        page,
        limit: PAGE_SIZE,
        departmentId: departmentId || undefined,
        severity: (severity as "Low" | "Medium" | "High") || undefined,
        complaintTypeId: complaintTypeId ? Number(complaintTypeId) : undefined,
        examinationStatusId: examinationStatusId ? Number(examinationStatusId) : undefined,
        receptionMethodId: receptionMethodId ? Number(receptionMethodId) : undefined,
        presentationStatusId: presentationStatusId ? Number(presentationStatusId) : undefined,
        complaintNumber: complaintNumber ? Number(complaintNumber) : undefined,
        statementYear: statementYear ? Number(statementYear) : undefined,
        sortBy: sortBy ?? undefined,
        sortOrder: sortOrder ?? undefined,
      }),
  });

  const complaints = response?.data.map(mapApiComplaint) ?? [];
  const meta = response?.meta;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة الشكاوى"
        description="متابعة ومعالجة جميع الشكاوى الواردة"
      >
        <NewComplaintButton newComplaintPath={PATHS.ADMIN.NEW_COMPLAINT} ocrPath={PATHS.ADMIN.COMPLAINT_OCR} />
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ComplaintList
          complaints={complaints}
          totalPages={meta?.totalPages ?? 1}
          totalCount={meta?.total ?? 0}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
