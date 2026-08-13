import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { LetterSettingsService } from "./letter-settings.service";
import {
  buildLetterContext,
  uploadRoot,
  type LetterComplaintSource,
} from "./letter-context";
import { renderLetterHtml } from "./renderers/html.renderer";
import { renderLetterDocx } from "./renderers/docx.renderer";

const COMPLAINT_INCLUDE = {
  citizen: true,
  department: true,
  receptionMethod: true,
  complaintType: true,
  examinationStatus: true,
  presentationStatus: true,
  createdBy: { select: { id: true, username: true, role: true } },
} as const;

@Injectable()
export class LettersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: LetterSettingsService,
  ) {}

  private async sampleSource(): Promise<LetterComplaintSource> {
    const last = await this.prisma.client.complaint.findFirst({
      orderBy: { createdAt: "desc" },
      include: { ...COMPLAINT_INCLUDE },
    });
    if (last) return last as unknown as LetterComplaintSource;

    const year = new Date().getFullYear();
    return {
      complaintNumber: 1234,
      statementYear: year,
      arrivalDate: new Date(),
      severity: "Medium",
      department: { name: "مديرية الصحة" },
      complaintType: { name: "خدمة" },
      receptionMethod: { name: "يدوي" },
      examinationStatus: { name: "قيد الفحص" },
      presentationStatus: { name: "لم يعرض" },
      citizen: {
        fullName: "محمد عبد الرحمن السيد",
        nationalId: "29002123456789",
        mobileNumber: "01012345678",
        address: "شارع سكة طنطا",
        village: "ميت خاقان",
        district: "شبين الكوم",
      },
      subject: "نموذج شكوى لمعاينة نموذج الخطاب (بيانات تجريبية)",
      annotation: "معاينة",
      respondentName: null,
      authorityResponseText: null,
      authorityResponseDate: null,
      incomingResponseNumber: null,
      archiveNumber: null,
      archiveDate: null,
      archiveLocation: null,
      createdBy: { username: "admin" },
      createdAt: new Date(),
    };
  }

  private async renderTemplate(
    template: { type: string; body: string | null; assetKey: string | null },
    source: LetterComplaintSource,
  ): Promise<Buffer> {
    const settings = await this.settingsService.getOrCreate();
    const context = buildLetterContext(source, settings);

    if (template.type === "HTML") {
      if (!template.body) {
        throw new BadRequestException("محتوى النموذج فارغ");
      }
      return renderLetterHtml(template.body, context);
    }

    if (template.type === "DOCX") {
      if (!template.assetKey) {
        throw new BadRequestException(
          "يجب رفع ملف DOCX لهذا النموذج قبل الإصدار",
        );
      }
      const assetPath = path.resolve(uploadRoot(), template.assetKey);
      if (!fs.existsSync(assetPath)) {
        throw new NotFoundException("ملف النموذج غير موجود على الخادم");
      }
      return renderLetterDocx(assetPath, context);
    }

    throw new BadRequestException(
      "نوع النموذج غير مدعوم حالياً، يرجى استخدام نموذج HTML أو DOCX",
    );
  }

  async preview(templateId: string): Promise<Buffer> {
    const template = await this.prisma.client.letterTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException("النموذج غير موجود");

    const source = await this.sampleSource();
    return this.renderTemplate(template, source);
  }

  async previewDraft(
    type: string,
    body: string | undefined,
    file: Express.Multer.File | undefined,
  ): Promise<Buffer> {
    const settings = await this.settingsService.getOrCreate();
    const source = await this.sampleSource();
    const context = buildLetterContext(source, settings);

    if (type === "HTML") {
      if (!body) {
        throw new BadRequestException("اكتب محتوى النموذج أولاً للمعاينة");
      }
      return renderLetterHtml(body, context);
    }

    if (type === "DOCX") {
      if (!file?.buffer?.length) {
        throw new BadRequestException("اختر ملف DOCX أولاً للمعاينة");
      }
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "letters-draft-"));
      try {
        const docxPath = path.join(tmpDir, "draft.docx");
        fs.writeFileSync(docxPath, file.buffer);
        return await renderLetterDocx(docxPath, context);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }

    throw new BadRequestException(
      "نوع النموذج غير مدعوم للمعاينة، يرجى استخدام HTML أو DOCX",
    );
  }

  async generate(complaintId: string, templateId: string, userId: string) {
    const complaint = await this.prisma.client.complaint.findUnique({
      where: { id: complaintId },
      include: { ...COMPLAINT_INCLUDE },
    });
    if (!complaint) throw new NotFoundException("الشكوى غير موجودة");

    const template = await this.prisma.client.letterTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException("النموذج غير موجود");
    }
    if (!template.isActive) {
      throw new NotFoundException("النموذج غير مفعّل حالياً");
    }

    const buffer = await this.renderTemplate(
      template,
      complaint as unknown as LetterComplaintSource,
    );

    const fileKey = `letters/${complaint.id}_${template.id}.pdf`;
    const dir = path.resolve(uploadRoot(), "letters");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.resolve(uploadRoot(), fileKey), buffer);

    await this.prisma.client.letterGeneration.upsert({
      where: {
        complaintId_templateId: { complaintId, templateId },
      },
      update: {
        fileKey,
        generatedById: userId,
        createdAt: new Date(),
      },
      create: {
        complaintId,
        templateId,
        fileKey,
        generatedById: userId,
      },
    });

    return {
      downloadUrl: `/uploads/${fileKey}`,
      filename: `letter-${template.name}-${complaint.complaintNumber}-${complaint.statementYear}.pdf`,
      mime: "application/pdf",
      templateId,
      templateName: template.name,
    };
  }

  async listGenerated(complaintId: string) {
    const rows = await this.prisma.client.letterGeneration.findMany({
      where: { complaintId },
      include: { template: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      id: row.id,
      templateId: row.template.id,
      templateName: row.template.name,
      type: row.template.type,
      fileKey: row.fileKey,
      downloadUrl: `/uploads/${row.fileKey}`,
      generatedAt: row.createdAt,
    }));
  }
}