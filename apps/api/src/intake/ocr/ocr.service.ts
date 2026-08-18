import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { createWorker, PSM } from "tesseract.js";
import { Jimp } from "jimp";

export interface OcrResult {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

const workerLogger = (logger: Logger) => (m: { status: string; progress: number }) => {
  if (m.status === "recognizing text") {
    logger.debug(`OCR progress: ${(m.progress * 100).toFixed(0)}%`);
  }
};

@Injectable()
export class OcrService implements OnModuleDestroy {
  private readonly logger = new Logger(OcrService.name);
  private worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  private workerReady: Promise<void> | null = null;

  private ensureWorker(): Promise<void> {
    if (this.workerReady) return this.workerReady;

    this.workerReady = (async () => {
      this.worker = await createWorker("ara+eng", 1, {
        logger: workerLogger(this.logger),
      });

      await this.worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
        tessedit_char_whitelist: "",
        preserve_interword_spaces: "1",
      });
    })();

    return this.workerReady;
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.workerReady = null;
    }
  }

  private async preprocess(buffer: Buffer): Promise<Buffer> {
    const image = await Jimp.read(buffer);
    image.greyscale().contrast(0.3).normalize();
    return image.getBuffer("image/jpeg");
  }

  async extract(imageBuffer: Buffer): Promise<OcrResult> {
    await this.ensureWorker();

    const processed = await this.preprocess(imageBuffer);

    const { data } = await this.worker!.recognize(processed);
    this.logger.log(`OCR complete: ${data.text.length} chars, mean confidence ${data.confidence?.toFixed(1)}%`);

    return {
      text: data.text || "",
      confidence: data.confidence ?? 0,
      blocks: (data.blocks ?? []).map((b) => ({
        text: b.text || "",
        confidence: b.confidence ?? 0,
        bbox: {
          x0: b.bbox?.x0 ?? 0,
          y0: b.bbox?.y0 ?? 0,
          x1: b.bbox?.x1 ?? 0,
          y1: b.bbox?.y1 ?? 0,
        },
      })),
    };
  }
}
