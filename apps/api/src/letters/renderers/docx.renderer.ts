import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import JSZip from "jszip";
import {
  IMAGE_PLACEHOLDER_KEYS,
  replacePlaceholders,
  type LetterContext,
} from "../letter-context";

const execFileAsync = promisify(execFile);

const DOCX_PART = "word/document.xml";
const PLACEHOLDER_RE = /\{\{[\w.]+\}\}/;

const SOFFICE_CANDIDATES = [
  process.env.SOFFICE_BIN,
  "/usr/bin/soffice",
  "/usr/bin/libreoffice",
  "/usr/local/bin/soffice",
  "/opt/libreoffice/program/soffice",
].filter((p): p is string => !!p && fs.existsSync(p));

function findSoffice(): string {
  const envPath = process.env.SOFFICE_BIN;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidates = [
    ...SOFFICE_CANDIDATES,
    "/opt/libreoffice/program/soffice",
  ];
  const matched = candidates.find((p) => fs.existsSync(p));
  if (matched) return matched;

  const home = process.env.HOME ?? "";
  for (const root of ["/opt", `${home}/.local/opt`]) {
    let entries: string[] = [];
    try {
      entries = fs.readdirSync(root);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.toLowerCase().startsWith("libreoffice")) continue;
      const bin = `${root}/${entry}/program/soffice`;
      if (fs.existsSync(bin)) return bin;
    }
  }

  throw new Error(
    "LibreOffice (soffice) غير متوفر. ثبّته على الخادم أو اضبط المتغير SOFFICE_BIN",
  );
}

/**
 * Merges split placeholder tokens that Word scatters across multiple <w:t>
 * runs (proofing marks, per-character formatting). Within every paragraph we
 * concatenate the text of its runs, replace placeholders on the merged text,
 * then write the result back into the first run (others emptied).
 */
function replaceInDocumentXml(
  documentXml: string,
  data: Record<string, string>,
): string {
  return documentXml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, (paragraph) => {
    if (!paragraph.includes("{{")) return paragraph;

    const runRe = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
    const runs: Array<{ full: string; open: string; text: string }> = [];
    let match: RegExpExecArray | null;
    let plain = "";
    while ((match = runRe.exec(paragraph)) !== null) {
      const open = match[0].slice(0, match[0].indexOf(">") + 1);
      runs.push({ full: match[0], open, text: match[1] });
      plain += match[1];
    }
    if (runs.length === 0 || !PLACEHOLDER_RE.test(plain)) return paragraph;

    const replaced = replacePlaceholders(plain, data);
    let rebuilt = paragraph;
    runs.forEach((run, index) => {
      const text = index === 0 ? replaced : "";
      rebuilt = rebuilt.replace(run.full, `${run.open}${text}</w:t>`);
    });
    return rebuilt;
  });
}

async function convertDocxToPdf(
  docxPath: string,
  outDir: string,
): Promise<string> {
  const soffice = findSoffice();
  await execFileAsync(soffice, [
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    outDir,
    docxPath,
  ]);
  const baseName = path.basename(docxPath, path.extname(docxPath));
  return path.join(outDir, `${baseName}.pdf`);
}

export async function renderLetterDocx(
  assetPath: string,
  context: LetterContext,
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(fs.readFileSync(assetPath));

  let documentXml = await zip.file(DOCX_PART)?.async("string");
  if (!documentXml) {
    throw new Error("ملف DOCX غير صالح: لا يحتوي على word/document.xml");
  }

  const textData = { ...context.data };
  for (const key of IMAGE_PLACEHOLDER_KEYS) {
    textData[key] = "";
  }
  documentXml = replaceInDocumentXml(documentXml, textData);
  zip.file(DOCX_PART, documentXml);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "letters-docx-"));
  try {
    const docxPath = path.join(tmpDir, "letter.docx");
    fs.writeFileSync(docxPath, await zip.generateAsync({ type: "nodebuffer" }));
    const pdfPath = await convertDocxToPdf(docxPath, tmpDir);
    return fs.readFileSync(pdfPath);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}