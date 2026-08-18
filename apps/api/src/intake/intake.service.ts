import { Injectable, Logger, ServiceUnavailableException, OnModuleInit } from "@nestjs/common";
import { OcrService } from "./ocr/ocr.service";
import {
  getOrCreateOcrAgent,
  ocrFieldsSchema,
  toFieldMap,
  sanitizeFields,
  MAX_OCR_TEXT_LENGTH,
} from "./agents/ocr-agent";
import { PrismaService } from "../prisma/prisma.service";
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

  constructor(
    private readonly ocrService: OcrService,
    private readonly prisma: PrismaService,
  ) {
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
    const text = rawText.trim().slice(0, MAX_OCR_TEXT_LENGTH);

    try {
      const agent = await getOrCreateOcrAgent();
      const departments = await this.prisma.department.findMany({
        select: { id: true, name: true, subAuthority: true },
        orderBy: { name: "asc" },
      });
      const complaintTypes = await this.prisma.complaintType.findMany({
        select: { id: true, name: true },
        orderBy: { id: "asc" },
      });

      const result = await agent.generate(
        `Extract structured fields from this OCR text extracted from a government complaint form:\n\n${text}\n\nDepartments list (use only these to resolve departmentId):\n${JSON.stringify(departments)}\n\nComplaint types list (use only these to resolve typeId):\n${JSON.stringify(complaintTypes)}`,
        {
          structuredOutput: {
            schema: ocrFieldsSchema,
            jsonPromptInjection: "auto",
            errorStrategy: "fallback",
            fallbackValue: { fields: {} },
          },
        },
      );

      return toFieldMap(sanitizeFields(result.object.fields));
    } catch (error) {
      this.logger.error("Mastra agent field extraction failed", error);
      throw new ServiceUnavailableException(
        "فشلت معالجة الاستخراج الذكي. يرجى المحاولة مرة أخرى.",
      );
    }
  }
}
