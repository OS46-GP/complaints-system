import type { ComplaintDetailsData } from "@/features/complaint-detail/types";
import { ComplaintDetailsView } from "@/features/complaint-detail/complaint-details-view";

const MOCK_COMPLAINT: ComplaintDetailsData = {
  id: "1",
  complaintNumber: "شكوى-2024-00142",
  statementYear: 2024,
  arrivalDate: "2024-10-14",
  status: "NotFinished",
  severity: "High",
  receptionMethodId: "1",
  complaintTypeId: "2",
  subject: "عدم إيداع مخصصات التعويض السنوية",
  respondentName: "فهد العتيبي",
  departmentId: "dept-1",
  presentationStatusId: "1",
  annotation:
    "يرجى العلم بأنه لم يتم إيداع مخصصات التعويض السنوية في حسابي البنكي حتى تاريخه، على الرغم من صدور الموافقة النهائية قبل أكثر من 30 يوماً عمل. لقد حاولت التواصل مع القسم المالي عدة مرات ولكن دون جدوى. أرجو التدخل السريع لحل هذه المشكلة حيث أنني بحاجة ماسة لهذه المبالغ للالتزامات العائلية.",
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
  citizenId: "cit-1",
  files: [
    {
      id: "f1",
      fileType: "image/png",
      storageKey: "document-scan.png",
      uploadedAt: "2024-10-14",
    },
    {
      id: "f2",
      fileType: "image/jpeg",
      storageKey: "transaction-confirmation.jpg",
      uploadedAt: "2024-10-14",
    },
    {
      id: "f3",
      fileType: "application/pdf",
      storageKey: "كشف حساب بنكي.pdf",
      uploadedAt: "2024-10-14",
    },
    {
      id: "f4",
      fileType: "application/docx",
      storageKey: "مراسلات سابقة.docx",
      uploadedAt: "2024-10-14",
    },
  ],
  actions: [
    {
      id: "a1",
      action: "تم استلام الشكوى بنجاح",
      actionDate: "2024-10-14",
      notes: "تم التحقق من الوثائق المرفقة وبدء المعالجة الأولية.",
      createdAt: "2024-10-14",
    },
    {
      id: "a2",
      action: "تم التعيين للمحقق المالي",
      actionDate: "2024-10-14",
      notes: "تم تحويل القضية للمراجعة الفنية من قبل فهد العتيبي.",
      createdAt: "2024-10-14",
    },
    {
      id: "a3",
      action: "قيد المراجعة حالياً",
      actionDate: "2024-10-14",
      notes: "يقوم القسم المالي بمطابقة البيانات مع السجلات البنكية.",
      createdAt: "2024-10-14",
    },
  ],
  escalations: [],
};

export default function AdminComplaintDetail() {
  return (
    <section className="p-0 md:p-stack-lg flex flex-col flex-grow">
      <ComplaintDetailsView
        complaint={MOCK_COMPLAINT}
        onEditDescription={() => console.log("Edit description")}
        onUploadFile={() => console.log("Upload file")}
      />
    </section>
  );
}
