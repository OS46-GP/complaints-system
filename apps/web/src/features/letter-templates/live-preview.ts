import { LETTER_VARIABLE_NOW } from "@/features/letter-variables/types";

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
img { max-width: 100%; max-height: 220px; object-fit: contain; }
.sign { margin-top: 26px; text-align: left; }
.sign img { max-height: 90px; max-width: 180px; }
.footer { margin-top: 30px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 8px; text-align: center; color: #555; }
.image-sample { display: inline-flex; align-items: center; gap: 6px; border: 1px dashed #c084fc; color: #a21caf; background: #faf5ff; padding: 2px 10px; border-radius: 6px; font-size: 13px; }
.image-sample svg { width: 14px; height: 14px; flex-shrink: 0; }
.preview-image-wrap { display: inline-block; max-width: 100%; }
.preview-image { display: inline-block; max-height: 110px; max-width: 100%; vertical-align: middle; }
.variable-sample { display: inline-block; border: 1px dashed #10b981; color: #047857; background: #ecfdf5; padding: 0 8px; border-radius: 6px; font-size: 13px; }
.unknown-ph { color: #b91c1c; background: #fef2f2; padding: 0 4px; border-radius: 4px; }
.empty-preview { display: flex; align-items: center; justify-content: center; min-height: 420px; color: #94a3b8; font-size: 14px; text-align: center; line-height: 1.8; }
`;

const EMPTY_PREVIEW = `<div class="empty-preview">لا يوجد محتوى بعد<br/>ابدأ بكتابة محتوى الخطاب في المحرر، وستظهر المعاينة هنا مباشرة.</div>`;

function escapePreviewText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface PreviewVariable {
  key: string;
  label?: string;
  defaultValue?: string;
  type?: "text" | "textarea" | "date" | "image";
  imageUrl?: string | null;
  imageLoaded?: boolean;
}

const IMAGE_FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';

function renderImageVariable(
  label: string,
  meta: PreviewVariable | undefined,
): string {
  if (meta?.imageUrl && meta.imageLoaded) {
    return `<span class="preview-image-wrap"><img src="${escapePreviewText(meta.imageUrl)}" class="preview-image" alt="${escapePreviewText(label)}" /></span>`;
  }
  return `<span class="image-sample">${IMAGE_FALLBACK_SVG}<span>${escapePreviewText(label)}</span></span>`;
}

function resolveNowValue(type: PreviewVariable["type"]): string {
  const now = new Date();
  const date = now.toLocaleDateString("ar-EG");
  if (type === "date") return date;
  const time = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

export function renderLetterPreview(
  body: string,
  variables?: PreviewVariable[],
): string {
  let html = body ?? "";

  if (!html.replace(/<[^>]*>/g, "").trim()) {
    html = EMPTY_PREVIEW;
  }

  const variablesList = variables ?? [];
  const imageMeta = new Map(
    variablesList
      .filter((v) => v.type === "image")
      .map((v) => [v.key, v] as const),
  );

  const imageUrlMap = new Map(
    variablesList
      .filter((v) => v.imageUrl && v.imageLoaded)
      .map((v) => [v.key, v.imageUrl] as const),
  );

  html = html.replace(/src="\{\{([^}]+)\}\}"/g, (_match, key: string) => {
    const url = imageUrlMap.get(key) ?? "";
    return `src="${escapePreviewText(url)}"`;
  });

  const variableMap = new Map(
    variablesList
      .filter(
        (v) =>
          v.type !== "image" &&
          !IMAGE_SAMPLES[v.key] &&
          !(v.key in SAMPLE_VALUES),
      )
      .map((v) => [
        v.key,
        `<span class="variable-sample">${
          v.defaultValue?.trim()
            ? v.defaultValue.trim() === LETTER_VARIABLE_NOW
              ? resolveNowValue(v.type)
              : escapePreviewText(v.defaultValue)
            : `[${v.label ?? v.key}]`
        }</span>`,
      ]),
  );

  for (const [key, label] of Object.entries(IMAGE_SAMPLES)) {
    html = html.replaceAll(
      `{{${key}}}`,
      renderImageVariable(label, imageMeta.get(key)),
    );
    variableMap.delete(key);
  }

  for (const v of variablesList) {
    if (v.type === "image" && !IMAGE_SAMPLES[v.key]) {
      html = html.replaceAll(
        `{{${v.key}}}`,
        renderImageVariable(v.label ?? v.key, imageMeta.get(v.key)),
      );
      variableMap.delete(v.key);
    }
  }

  for (const [key, value] of Object.entries(SAMPLE_VALUES)) {
    html = html.replaceAll(
      `{{${key}}}`,
      `<span class="variable-sample">${value}</span>`,
    );
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