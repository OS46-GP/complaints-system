import { renderHtmlToPdf } from "../../reporting/pdf-generator";
import {
  escapeHtml,
  replacePlaceholders,
  type LetterContext,
} from "../letter-context";

const WRAPPER_STYLE = `
html, body { margin: 0; padding: 0; }
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
img { max-width: 100%; }
img.letter-var-img { max-height: 110px; max-width: 100%; object-fit: contain; }
.sign { margin-top: 26px; text-align: left; }
.sign img { max-height: 90px; max-width: 180px; }
.footer { margin-top: 30px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 8px; text-align: center; color: #555; }
.var-unset { display: inline-block; border: 1px dashed #d97706; color: #b45309; background: #fffbeb; padding: 0 6px; border-radius: 4px; font-size: 12px; white-space: nowrap; }
`;

const UNSET_VALUE_MARK =
  '<span class="var-unset">قيمة غير معبأة</span>';
const UNKNOWN_VARIABLE_MARK =
  '<span class="var-unset">متغير غير معروف</span>';

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<style>${WRAPPER_STYLE}</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function renderLetterHtml(
  body: string,
  context: LetterContext,
): Promise<Buffer> {
  let html = body;

  html = html.replace(
    /<img[^>]*src="\{\{([^}]+)\}\}"[^>]*\/?>/g,
    (match, key: string) => {
      const src = context.images[key];
      if (src) {
        const withSrc = match.replace(`src="{{${key}}}"`, `src="${src}"`);
        return /\bclass="/.test(withSrc)
          ? withSrc
          : withSrc.replace(/^<img/, '<img class="letter-var-img"');
      }
      const fallback = context.imageFallbacks?.[key]?.trim();
      return fallback ? escapeHtml(fallback) : UNSET_VALUE_MARK;
    },
  );

  const imageKeys = new Set([
    ...Object.keys(context.images),
    ...Object.keys(context.imageFallbacks ?? {}),
  ]);
  for (const key of imageKeys) {
    const src = context.images[key];
    const fallback = context.imageFallbacks?.[key];
    if (src) {
      html = html.replaceAll(
        `{{${key}}}`,
        `<img src="${src}" class="letter-var-img" alt="" />`,
      );
    } else if (fallback?.trim()) {
      html = html.replaceAll(`{{${key}}}`, escapeHtml(fallback));
    } else {
      html = html.replaceAll(`{{${key}}}`, UNSET_VALUE_MARK);
    }
  }

  const escapedData: Record<string, string> = {};
  for (const [key, value] of Object.entries(context.data)) {
    escapedData[key] = value?.trim() ? escapeHtml(value) : UNSET_VALUE_MARK;
  }

  html = replacePlaceholders(html, escapedData);

  html = html.replace(
    /\{\{([^}]+)\}\}/g,
    () => UNKNOWN_VARIABLE_MARK,
  );

  return renderHtmlToPdf(wrapHtml(html));
}