import { z } from "zod";
import type { FieldPath } from "react-hook-form";

const fileItemSchema = z.object({
  file: z.instanceof(File, { error: "ملف غير صالح" }),
  id: z.string().min(1, "معرف الملف مطلوب"),
});

const citizenSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل للمواطن مطلوب"),
  nationalId: z
    .string()
    .regex(/^$|^\d{14}$/, "الرقم القومي يجب أن يتكون من 14 رقماً"),
  mobileNumber: z
    .string()
    .regex(/^$|^01[0125]\d{8}$/, "أدخل رقم جوال مصري صحيح (11 رقماً يبدأ بـ 01)"),
  address: z.string().max(300, "العنوان يجب ألا يزيد عن 300 حرف"),
  village: z.string(),
  district: z.string(),
});

const complaintFields = {
  subject: z
    .string()
    .trim()
    .min(5, "موضوع الشكوى يجب ألا يقل عن 5 أحرف")
    .max(200, "موضوع الشكوى يجب ألا يزيد عن 200 حرف"),
  complaintTypeId: z.string().min(1, "يرجى اختيار الفئة"),
  severity: z.enum(["Low", "Medium", "High"]),
  receptionMethodId: z.string(),
  respondentName: z.string().max(100, "اسم المقدم يجب ألا يزيد عن 100 حرف"),
  departmentId: z.string(),
  presentationStatusId: z.string(),
  citizen: citizenSchema,
  files: z.array(fileItemSchema).max(5, "يمكن إرفاق 5 ملفات كحد أقصى"),
} as const;

export const complaintCreateSchema = z.object({
  ...complaintFields,
  annotation: z
    .string()
    .trim()
    .min(20, "يرجى كتابة وصف تفصيلي للشكوى (20 حرفاً على الأقل)")
    .max(5000, "الوصف يجب ألا يزيد عن 5000 حرف"),
});

export const complaintEditSchema = z.object({
  ...complaintFields,
  annotation: z.string().max(5000, "الوصف يجب ألا يزيد عن 5000 حرف"),
});

export type ComplaintCreateFormValues = z.infer<typeof complaintCreateSchema>;

export const emptyFormValues: ComplaintCreateFormValues = {
  subject: "",
  complaintTypeId: "",
  severity: "Medium",
  receptionMethodId: "",
  respondentName: "",
  departmentId: "",
  annotation: "",
  presentationStatusId: "",
  citizen: {
    fullName: "",
    nationalId: "",
    mobileNumber: "",
    address: "",
    village: "",
    district: "",
  },
  files: [],
};

export const STEP_FIELDS: FieldPath<ComplaintCreateFormValues>[][] = [
  [
    "subject",
    "severity",
    "complaintTypeId",
    "citizen.fullName",
    "citizen.nationalId",
    "citizen.mobileNumber",
  ],
  ["annotation"],
  ["files"],
  [],
];
