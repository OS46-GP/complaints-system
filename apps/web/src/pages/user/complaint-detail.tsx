import type { ComplaintDetailsData } from "@/types/complaint-details.types";
import { ComplaintDetailsView } from "@/components/complaint-details-view";

const MOCK_COMPLAINT: ComplaintDetailsData = {
  id: "1",
  complaintNumber: "شكوى-2024-00142",
  statementYear: 2024,
  arrivalDate: "2024-10-14",
  status: "NotFinished",
  severity: "Medium",
  receptionMethodId: "2",
  complaintTypeId: "1",
  subject: "استفسار عن معاملة حجز أرض",
  respondentName: "",
  departmentId: "dept-3",
  presentationStatusId: "2",
  annotation:
    "أتقدم بهذا الاستفسار بخصوص معاملة حجز قطعة الأرض رقم ٤٥٢٣ في حي النخيل. تم تقديم الطلب منذ ٤٥ يوماً ولم يتم البت فيه حتى الآن.",
  examinationStatusId: "",
  examinationResult: "",
  authorityResponseText: "",
  authorityResponseDate: "",
  outgoingLetterNumber: "",
  outgoingLetterDate: "",
  incomingResponseNumber: "",
  notificationMethod: "",
  notificationOutNumber: "",
  notificationOutDate: "",
  archiveNumber: "",
  archiveDate: "",
  archiveLocation: "",
  weeklyMeeting: null,
  finalDecisionDate: "",
  endDate: "",
  citizenId: "cit-2",
  files: [
    {
      id: "f1",
      fileType: "application/pdf",
      storageKey: "طلب حجز أرض.pdf",
      uploadedAt: "2024-10-10",
    },
  ],
  actions: [
    {
      id: "a1",
      action: "تم استلام الطلب",
      actionDate: "2024-10-10",
      notes: "تم تسجيل الطلب في النظام.",
      createdAt: "2024-10-10",
    },
  ],
  escalations: [],
};

export default function UserComplaintDetail() {
  return (
    <section className="p-0 md:p-stack-lg flex flex-col flex-grow">
      <ComplaintDetailsView complaint={MOCK_COMPLAINT} />
    </section>
  );
}
