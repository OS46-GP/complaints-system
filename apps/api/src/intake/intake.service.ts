import { Injectable, Logger, ServiceUnavailableException, OnModuleInit } from "@nestjs/common";
import { OcrService } from "./ocr/ocr.service";
import { getOrCreateOcrAgent } from "./agents/ocr-agent";
import * as path from "path";
import * as fs from "fs";

export interface FieldResult {
  value: string;
  confidence: number;
}

export interface OcrIntakeResult {
  fields: Record<string, FieldResult>;
  imageUrl: string;
}

@Injectable()
export class IntakeService implements OnModuleInit {
  private readonly logger = new Logger(IntakeService.name);
  private readonly uploadDir: string;

  constructor(private readonly ocrService: OcrService) {
    this.uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
  }

  onModuleInit() {
    const ocrDir = path.join(this.uploadDir, "ocr");
    if (!fs.existsSync(ocrDir)) {
      fs.mkdirSync(ocrDir, { recursive: true });
    }
  }

  async processOcr(file: Express.Multer.File): Promise<OcrIntakeResult> {
    const imageUrl = await this.storeImage(file);

    this.logger.log(`Running OCR on ${file.originalname} (${file.size} bytes)`);
    const ocrResult = await this.ocrService.extract(file.buffer);
    this.logger.log(`OCR extracted ${ocrResult.text.length} chars at confidence ${ocrResult.confidence.toFixed(1)}%`);

    this.logger.log("Running Mastra agent for field extraction");
    const fields = await this.extractFields(ocrResult.text);

    return { fields, imageUrl };
  }

  private async storeImage(file: Express.Multer.File): Promise<string> {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF.]/g, "_");
    const storageKey = `ocr/${Date.now()}-${safeName}`;
    const filePath = path.join(this.uploadDir, storageKey);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);
    this.logger.log(`Image stored at ${storageKey}`);

    return `/uploads/${storageKey}`;
  }

  private async extractFields(rawText: string): Promise<Record<string, FieldResult>> {
    try {
      const agent = await getOrCreateOcrAgent();

      const result = await agent.generate(
        `Extract structured fields from this OCR text extracted from a government complaint form:\n\n${rawText}`,
      );

      const parsed = this.parseAgentResponse(result.text);

      return parsed;
    } catch (error) {
      this.logger.error("Mastra agent field extraction failed", error);
      throw new ServiceUnavailableException(
        "فشلت معالجة الاستخراج الذكي. يرجى المحاولة مرة أخرى.",
      );
    }
  }

  private parseAgentResponse(text: string): Record<string, FieldResult> {
    try {
      const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      if (!parsed || typeof parsed !== "object" || !parsed.fields) {
        throw new Error("Agent response missing fields");
      }

      const fields: Record<string, FieldResult> = {};
      for (const [key, val] of Object.entries(parsed.fields)) {
        const v = val as { value?: unknown; confidence?: unknown };
        if (
          typeof v.value === "string" &&
          typeof v.confidence === "number" &&
          v.value.length > 0
        ) {
          fields[key] = { value: v.value, confidence: v.confidence };
        }
      }

      return fields;
    } catch {
      this.logger.warn("Agent returned unparseable response");
      return {};
    }
  }
}
