import * as fs from "node:fs";
import * as path from "node:path";
import { computeCaseStatus } from "../complaints/case-status.config";

export const SEVERITY_LABELS: Record<string, string> = {
  Low: "منخفضة",
  Medium: "متوسطة",
  High: "عالية",
};

export const CASE_STATUS_LABELS: Record<string, string> = {
  FINISHED: "منتهي",
  NOT_FINISHED: "غير منتهي",
};

export const IMAGE_PLACEHOLDER_KEYS = [
  "organizationLetterhead",
  "managerSignature",
  "seal",
] as const;

export interface PlaceholderItem {
  key: string;
  label: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "textarea" | "date";
  group?: string;
  defaultValue?: string;
}

export interface PlaceholderGroup {
  group: string;
  label: string;
  items: PlaceholderItem[];
}

export const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
  {
    group: "complaint",
    label: "بيانات الشكوى",
    items: [
      { key: "complaintNumber", label: "رقم الشكوى" },
      { key: "statementYear", label: "سنة البيان" },
      { key: "arrivalDate", label: "تاريخ الوصول" },
      { key: "severity", label: "الدرجة" },
      { key: "department", label: "الجهة المختصة" },
      { key: "departmentOfficial", label: "السيد/ مدير الجهة" },
      { key: "complaintType", label: "فئة الشكوى" },
      { key: "receptionMethod", label: "طريقة الاستلام" },
      { key: "examinationStatus", label: "حالة الفحص" },
      { key: "presentationStatus", label: "حالة العرض" },
      { key: "caseStatus", label: "حالة القضية" },
      { key: "citizenName", label: "اسم المواطن" },
      { key: "citizenNationalId", label: "الرقم القومي" },
      { key: "citizenMobile", label: "الهاتف" },
      { key: "citizenAddress", label: "العنوان" },
      { key: "citizenVillage", label: "القرية" },
      { key: "citizenDistrict", label: "المركز" },
      { key: "subject", label: "موضوع الشكوى" },
      { key: "annotation", label: "الملاحظات" },
      { key: "respondentName", label: "اسم المسؤول" },
      { key: "authorityResponseText", label: "رد الجهة المختصة" },
      { key: "authorityResponseDate", label: "تاريخ الرد" },
      { key: "incomingResponseNumber", label: "رقم الرد الوارد" },
      { key: "archiveNumber", label: "رقم الأرشيف" },
      { key: "archiveDate", label: "تاريخ الأرشفة" },
      { key: "archiveLocation", label: "موقع الأرشيف" },
      { key: "createdBy", label: "أدخلها" },
      { key: "createdAt", label: "تاريخ الإدخال" },
    ],
  },
  {
    group: "settings",
    label: "بيانات الجهة والمدير",
    items: [
      { key: "organizationNameAr", label: "اسم الجهة (عربي)" },
      { key: "organizationNameEn", label: "اسم الجهة (إنجليزي)" },
      { key: "organizationAddress", label: "عنوان الجهة" },
      { key: "organizationPhone", label: "هاتف الجهة" },
      { key: "organizationFax", label: "فاكس الجهة" },
      { key: "organizationEmail", label: "البريد الإلكتروني" },
      { key: "organizationWebsite", label: "الموقع الإلكتروني" },
      { key: "organizationLetterhead", label: "ترويسة الجهة (صورة)" },
      { key: "managerName", label: "اسم المدير" },
      { key: "managerTitle", label: "صفة المدير" },
      { key: "managerSignature", label: "توقيع المدير (صورة)" },
      { key: "seal", label: "الختم الرسمي (صورة)" },
      { key: "responseDefaultDays", label: "مدة الرد المطلوبة (أيام)" },
    ],
  },
  {
    group: "special",
    label: "بيانات الإصدار",
    items: [
      { key: "generatedDate", label: "تاريخ إصدار الخطاب" },
      { key: "generatedTime", label: "وقت إصدار الخطاب" },
    ],
  },
];

export function escapeHtml(value: string): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function replacePlaceholders(
  template: string,
  data: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export function mergeVariableValues(
  data: Record<string, string>,
  values?: Record<string, string> | null,
): Record<string, string> {
  if (!values) return data;
  const merged = { ...data };
  for (const [key, value] of Object.entries(values)) {
    merged[key] = value ?? "";
  }
  return merged;
}

export function missingRequiredVariables(
  templateVariables: TemplateVariable[] | null | undefined,
  values?: Record<string, string> | null,
): string[] {
  if (!templateVariables?.length) return [];
  return templateVariables
    .filter((v) => v.required && !(values?.[v.key] ?? "").trim())
    .map((v) => v.label);
}

export function uploadRoot(): string {
  return path.resolve(process.env.UPLOAD_DIR || "uploads");
}

export function imageToDataUri(
  storageKey: string | null | undefined,
): string | undefined {
  if (!storageKey) return undefined;
  const fullPath = path.resolve(uploadRoot(), storageKey);
  if (!fs.existsSync(fullPath)) return undefined;
  const ext = path.extname(fullPath).toLowerCase();
  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".svg"
            ? "image/svg+xml"
            : "application/octet-stream";
  return `data:${mime};base64,${fs.readFileSync(fullPath).toString("base64")}`;
}

export interface LetterSettingsRow {
  organizationNameAr: string | null;
  organizationNameEn: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationFax: string | null;
  organizationEmail: string | null;
  organizationWebsite: string | null;
  organizationLetterhead: string | null;
  managerName: string | null;
  managerTitle: string | null;
  managerSignature: string | null;
  seal: string | null;
  responseDefaultDays: number;
}

export interface LetterComplaintSource {
  complaintNumber: number;
  statementYear: number;
  arrivalDate: Date;
  severity: string;
  department?: { name: string | null } | null;
  complaintType?: { name: string | null } | null;
  receptionMethod?: { name: string | null } | null;
  examinationStatus?: { name: string | null } | null;
  presentationStatus?: { name: string | null } | null;
  citizen: {
    fullName: string;
    nationalId: string | null;
    mobileNumber: string | null;
    address: string | null;
    village: string | null;
    district: string | null;
  };
  subject: string;
  annotation?: string | null;
  respondentName?: string | null;
  authorityResponseText?: string | null;
  authorityResponseDate?: Date | null;
  incomingResponseNumber?: string | null;
  archiveNumber?: string | null;
  archiveDate?: Date | null;
  archiveLocation?: string | null;
  createdBy?: { username: string } | null;
  createdAt: Date;
}

export interface LetterContext {
  data: Record<string, string>;
  images: Record<string, string>;
}

export function buildLetterContext(
  complaint: LetterComplaintSource,
  settings: LetterSettingsRow,
  now: Date = new Date(),
): LetterContext {
  const formatDate = (date: Date | null | undefined) =>
    date ? new Date(date).toLocaleDateString("ar-EG") : "—";

  const data: Record<string, string> = {
    complaintNumber: String(complaint.complaintNumber),
    statementYear: String(complaint.statementYear),
    arrivalDate: formatDate(complaint.arrivalDate),
    severity: SEVERITY_LABELS[complaint.severity] ?? "—",
    department: complaint.department?.name ?? "—",
    departmentOfficial: `السيد/ مدير ${complaint.department?.name ?? "الجهة المختصة"}`,
    complaintType: complaint.complaintType?.name ?? "—",
    receptionMethod: complaint.receptionMethod?.name ?? "—",
    examinationStatus: complaint.examinationStatus?.name ?? "—",
    presentationStatus: complaint.presentationStatus?.name ?? "—",
    caseStatus:
      CASE_STATUS_LABELS[
        computeCaseStatus(complaint.examinationStatus?.name ?? null)
      ] ?? "—",
    citizenName: complaint.citizen.fullName,
    citizenNationalId: complaint.citizen.nationalId || "—",
    citizenMobile: complaint.citizen.mobileNumber || "—",
    citizenAddress: complaint.citizen.address || "—",
    citizenVillage: complaint.citizen.village || "—",
    citizenDistrict: complaint.citizen.district || "—",
    subject: complaint.subject,
    annotation: complaint.annotation || "لا يوجد",
    respondentName: complaint.respondentName || "—",
    authorityResponseText: complaint.authorityResponseText || "—",
    authorityResponseDate: formatDate(complaint.authorityResponseDate),
    incomingResponseNumber: complaint.incomingResponseNumber || "—",
    archiveNumber: complaint.archiveNumber || "—",
    archiveDate: formatDate(complaint.archiveDate),
    archiveLocation: complaint.archiveLocation || "—",
    createdBy: complaint.createdBy?.username ?? "—",
    createdAt: formatDate(complaint.createdAt),
    generatedDate: now.toLocaleDateString("ar-EG"),
    generatedTime: now.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    responseDefaultDays: String(settings.responseDefaultDays ?? 15),
  };

  const textKeys = [
    "organizationNameAr",
    "organizationNameEn",
    "organizationAddress",
    "organizationPhone",
    "organizationFax",
    "organizationEmail",
    "organizationWebsite",
  ] as const;
  for (const key of textKeys) {
    data[key] = settings[key] ?? "";
  }

  const images: Record<string, string> = {};
  for (const key of IMAGE_PLACEHOLDER_KEYS) {
    const storageKey = settings[key];
    const dataUri = imageToDataUri(storageKey);
    if (dataUri) images[key] = dataUri;
  }

  return { data, images };
}