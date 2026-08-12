import { renderHtmlToPdf } from "../../reporting/pdf-generator";
import {
  IMAGE_PLACEHOLDER_KEYS,
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
.sign { margin-top: 26px; text-align: left; }
.sign img { max-height: 90px; max-width: 180px; }
.footer { margin-top: 30px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 8px; text-align: center; color: #555; }
`;

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

  for (const key of IMAGE_PLACEHOLDER_KEYS) {
    const src = context.images[key];
    if (src) {
      html = html.replaceAll(`{{${key}}}`, `<img src="${src}" alt="" />`);
    }
  }

  const escapedData: Record<string, string> = {};
  for (const [key, value] of Object.entries(context.data)) {
    escapedData[key] = escapeHtml(value);
  }

  html = replacePlaceholders(html, escapedData);

  return renderHtmlToPdf(wrapHtml(html));
}