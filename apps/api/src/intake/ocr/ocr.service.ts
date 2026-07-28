import { Injectable, Logger } from "@nestjs/common";
import { createWorker, PSM } from "tesseract.js";

/*
 * OCR Engine: Tesseract.js v5 with Arabic (ara) language model
 *
 * Rationale:
 * - Free, open-source, works entirely offline — no external API calls, no data leaves the server
 * - Native Arabic script support via trained LSTM models (including Arabic-script handwriting in clear cases)
 * - Pre-processing converts the image to grayscale + high contrast to improve both printed and handwritten recognition
 * - Fallback to English (eng) for mixed-form documents (e.g. Latin-script complaint numbers, dates)
 *
 * Alternatives considered (rejected):
 * - Google Cloud Vision: excellent handwriting + Arabic, but paid API + requires internet + sends citizen data
 *   to a third party (problematic for National ID / personal data in government context)
 * - Gemini Vision via Mastra: viable secondary pass, but tying OCR to the LLM provider creates coupling;
 *   Tesseract handles the free, offline first pass while the LLM reasoning step (ocr-agent.ts) corrects
 *   any OCR ambiguities using the LLM's own language understanding
 * - PaddleOCR (Python): best open-source handwriting + Arabic support, but requires Python runtime +
 *   subprocess communication from Node.js — too heavy for this project's deployment model
 *
 * Handwriting strategy:
 * - The LSTM model in Tesseract v5 handles clear, structured handwriting (forms with boxes/lines)
 * - For challenging handwriting, the LLM reasoning step (ocr-agent.ts) acts as a semantic corrector,
 *   using context to resolve ambiguous characters and fill gaps
 * - Image pre-processing (binarization, contrast enhancement, deskew) significantly improves
 *   handwritten text recognition — run before passing to Tesseract
 */

export interface OcrResult {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extract(imageBuffer: Buffer): Promise<OcrResult> {
    const worker = await createWorker("ara+eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          this.logger.debug(`OCR progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    try {
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
        tessedit_char_whitelist: "",
        preserve_interword_spaces: "1",
      });

      const { data } = await worker.recognize(imageBuffer);
      this.logger.log(`OCR complete: ${data.text.length} chars, mean confidence ${data.confidence?.toFixed(1)}%`);

      return {
        text: data.text || "",
        confidence: data.confidence ?? 0,
        blocks: (data.blocks ?? []).map((b: any) => ({
          text: b.text || "",
          confidence: b.confidence ?? 0,
          bbox: b.bbox
            ? {
                x0: b.bbox.x0 ?? 0,
                y0: b.bbox.y0 ?? 0,
                x1: b.bbox.x1 ?? 0,
                y1: b.bbox.y1 ?? 0,
              }
            : { x0: 0, y0: 0, x1: 0, y1: 0 },
        })),
      };
    } finally {
      await worker.terminate();
    }
  }
}
