export const SAMPLE_VALUES: Record<string, string> = {
  complaintNumber: "12345",
  statementYear: "2026",
  arrivalDate: "17/07/2026",
  severity: "متوسطة",
  department: "مديرية الصحة",
  departmentOfficial: "السيد/ مدير مديرية الصحة",
  complaintType: "خدمة",
  receptionMethod: "يدوي",
  examinationStatus: "قيد الفحص",
  presentationStatus: "لم يعرض",
  caseStatus: "غير منتهي",
  citizenName: "محمد عبد الرحمن السيد",
  citizenNationalId: "29002123456789",
  citizenMobile: "01012345678",
  citizenAddress: "شارع سكة طنطا، شبين الكوم",
  citizenVillage: "ميت خاقان",
  citizenDistrict: "شبين الكوم",
  subject: "نقص خدمة المياه في القرية",
  annotation: "لا يوجد",
  respondentName: "أحمد فؤاد",
  authorityResponseText: "جارٍ فحص الشكوى وبيان الحالة",
  authorityResponseDate: "20/07/2026",
  incomingResponseNumber: "—",
  archiveNumber: "—",
  archiveDate: "—",
  archiveLocation: "—",
  createdBy: "admin",
  createdAt: "15/07/2026",
  organizationNameAr: "محافظة المنوفية",
  organizationNameEn: "Menoufia Governorate",
  organizationAddress: "شارع جمال عبد الناصر، شبين الكوم",
  organizationPhone: "048-2220000",
  organizationFax: "—",
  organizationEmail: "info@menoufia.gov.eg",
  organizationWebsite: "www.menoufia.gov.eg",
  responseDefaultDays: "15",
  generatedDate: "13/08/2026",
  generatedTime: "10:30 ص",
};

const IMAGE_SAMPLES: Record<string, string> = {
  organizationLetterhead: "ترويسة الجهة",
  managerSignature: "توقيع المدير",
  seal: "الختم الرسمي",
};

const PREVIEW_STYLE = `
html, body { margin: 0; padding: 16px; }
body {
  font-family: "Traditional Arabic", "Amiri", Arial, sans-serif;
  font-size: 15px;
  line-height: 1.9;
  color: #111;
  direction: rtl;
}
.letter-head { text-align: center; margin-bottom: 18px; }
.letter-head .org-name { font-size: 20px; font-weight: bold; }
.letter-head .org-sub { font-size: 14px; margin-top: 4px; }
.letter-head img { max-height: 110px; max-width: 100%; }
.meta { font-size: 13px; margin-bottom: 14px; }
.to { font-weight: bold; margin: 10px 0; }
.greeting { margin: 8px 0; }
.sign { margin-top: 26px; text-align: left; }
.sign img { max-height: 90px; max-width: 180px; }
.footer { margin-top: 30px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 8px; text-align: center; color: #555; }
.image-sample { display: inline-block; border: 1px dashed #c084fc; color: #a21caf; background: #faf5ff; padding: 2px 10px; border-radius: 6px; font-size: 13px; }
.variable-sample { display: inline-block; border: 1px dashed #0ea5e9; color: #0369a1; background: #f0f9ff; padding: 0 8px; border-radius: 6px; font-size: 13px; }
.unknown-ph { color: #b91c1c; background: #fef2f2; padding: 0 4px; border-radius: 4px; }
.empty-preview { display: flex; align-items: center; justify-content: center; min-height: 420px; color: #94a3b8; font-size: 14px; text-align: center; line-height: 1.8; }
`;

const EMPTY_PREVIEW = `<div class="empty-preview">لا يوجد محتوى بعد<br/>ابدأ بكتابة محتوى الخطاب في المحرر، وستظهر المعاينة هنا مباشرة.</div>`;

export interface PreviewVariable {
  key: string;
  label: string;
}

export function renderLetterPreview(
  body: string,
  variables?: PreviewVariable[],
): string {
  let html = body ?? "";

  if (!html.replace(/<[^>]*>/g, "").trim()) {
    html = EMPTY_PREVIEW;
  }

  const variableMap = new Map(
    (variables ?? []).map((v) => [
      v.key,
      `<span class="variable-sample">[${v.label}]</span>`,
    ]),
  );

  for (const [key, label] of Object.entries(IMAGE_SAMPLES)) {
    html = html.replaceAll(
      `{{${key}}}`,
      `<span class="image-sample">${label}</span>`,
    );
    variableMap.delete(key);
  }

  for (const [key, value] of Object.entries(SAMPLE_VALUES)) {
    html = html.replaceAll(`{{${key}}}`, value);
    variableMap.delete(key);
  }

  for (const [key, sample] of variableMap.entries()) {
    html = html.replaceAll(`{{${key}}}`, sample);
  }

  html = html.replace(
    /\{\{([^}]+)\}\}/g,
    (match) => `<span class="unknown-ph">${match}</span>`,
  );

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<style>${PREVIEW_STYLE}</style>
</head>
<body>
${html}
</body>
</html>`;
}