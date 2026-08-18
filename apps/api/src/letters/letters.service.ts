import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { LetterSettingsService } from "./letter-settings.service";
import {
  buildLetterContext,
  imageToDataUri,
  imageUrlToStorageKey,
  mergeVariableValues,
  missingRequiredVariables,
  resolveLetterVariableDefaultValue,
  uploadRoot,
  type LetterComplaintSource,
  type TemplateVariable,
} from "./letter-context";
import { renderLetterHtml } from "./renderers/html.renderer";

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

  private async globalVariableRows() {
    return this.prisma.client.letterVariable.findMany({
      where: { isSystem: false, isActive: true },
      select: {
        key: true,
        labelAr: true,
        defaultValue: true,
        imageUrl: true,
        fallbackText: true,
        required: true,
        type: true,
      },
    });
  }

  private mergeGlobalDefaults(
    context: { data: Record<string, string> },
    rows: Awaited<ReturnType<LettersService["globalVariableRows"]>>,
  ) {
    const now = new Date();
    for (const row of rows) {
      if (row.type === "image") continue;
      const value = resolveLetterVariableDefaultValue(
        row.defaultValue,
        row.type,
        now,
      );
      if (value?.trim()) {
        context.data[row.key] = value;
      }
    }
  }

  private mergeGlobalImages(
    context: {
      images: Record<string, string>;
      imageFallbacks?: Record<string, string>;
    },
    rows: Awaited<ReturnType<LettersService["globalVariableRows"]>>,
  ) {
    const fallbacks = (context.imageFallbacks ??= {});
    for (const row of rows) {
      if (row.type !== "image") continue;
      const storageKey = imageUrlToStorageKey(row.imageUrl);
      const dataUri = imageToDataUri(storageKey);
      if (dataUri) {
        context.images[row.key] = dataUri;
      } else if (row.fallbackText?.trim()) {
        fallbacks[row.key] = row.fallbackText;
      }
    }
  }

  private mergeTemplateImages(
    context: {
      images: Record<string, string>;
      imageFallbacks?: Record<string, string>;
    },
    templateVariables?: TemplateVariable[] | null,
  ) {
    const fallbacks = (context.imageFallbacks ??= {});
    for (const v of templateVariables ?? []) {
      if (v.type !== "image") continue;
      const storageKey = imageUrlToStorageKey(v.imageUrl);
      const dataUri = imageToDataUri(storageKey);
      if (dataUri) {
        context.images[v.key] = dataUri;
      } else if (v.fallbackText?.trim()) {
        fallbacks[v.key] = v.fallbackText;
      }
    }
  }

  private async renderTemplate(
    template: {
      body: string | null;
      variables?: TemplateVariable[] | null;
    },
    source: LetterComplaintSource,
    variableValues?: Record<string, string> | null,
  ): Promise<Buffer> {
    const settings = await this.settingsService.getOrCreate();
    const context = buildLetterContext(source, settings);
    const globals = await this.globalVariableRows();
    this.mergeGlobalDefaults(context, globals);
    this.mergeGlobalImages(context, globals);
    this.mergeTemplateImages(context, template.variables);
    if (variableValues) {
      context.data = mergeVariableValues(context.data, variableValues);
    }

    if (!template.body) {
      throw new BadRequestException("محتوى النموذج فارغ");
    }
    return renderLetterHtml(template.body, context);
  }

  private static sampleVariableValues(
    templateVariables?: TemplateVariable[] | null,
  ): Record<string, string> | null {
    if (!templateVariables?.length) return null;
    const samples: Record<string, string> = {};
    for (const v of templateVariables) {
      if (v.type === "image") continue;
      samples[v.key] = v.defaultValue?.trim() ? v.defaultValue : `[${v.label}]`;
    }
    return samples;
  }

  private static fixedVariableValues(
    templateVariables?: TemplateVariable[] | null,
  ): Record<string, string> | null {
    if (!templateVariables?.length) return null;
    const values: Record<string, string> = {};
    for (const v of templateVariables) {
      if (v.type === "image") continue;
      if (v.defaultValue) values[v.key] = v.defaultValue;
    }
    return values;
  }

  async preview(templateId: string): Promise<Buffer> {
    const template = await this.prisma.client.letterTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException("النموذج غير موجود");

    const source = await this.sampleSource();
    const templateVariables = (template as {
      variables?: TemplateVariable[] | null;
    }).variables;
    return this.renderTemplate(
      template as {
        body: string | null;
        variables?: TemplateVariable[] | null;
      },
      source,
      LettersService.sampleVariableValues(templateVariables),
    );
  }

  async previewDraft(
    body: string | undefined,
    variables?: TemplateVariable[] | null,
  ): Promise<Buffer> {
    const settings = await this.settingsService.getOrCreate();
    const source = await this.sampleSource();
    const context = buildLetterContext(source, settings);
    const globals = await this.globalVariableRows();
    this.mergeGlobalDefaults(context, globals);
    this.mergeGlobalImages(context, globals);
    this.mergeTemplateImages(context, variables);
    const sampleValues = LettersService.sampleVariableValues(variables);
    if (sampleValues) {
      context.data = mergeVariableValues(context.data, sampleValues);
    }

    if (!body) {
      throw new BadRequestException("اكتب محتوى النموذج أولاً للمعاينة");
    }
    return renderLetterHtml(body, context);
  }

  async generate(
    complaintId: string,
    templateId: string,
    userId: string,
  ) {
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

    const templateVariables = (template as {
      variables?: TemplateVariable[] | null;
    }).variables;
    const fixedValues = LettersService.fixedVariableValues(templateVariables);
    const missing = missingRequiredVariables(templateVariables, fixedValues);
    const globals = await this.globalVariableRows();
    if (template.body) {
      for (const variable of globals) {
        if (
          variable.required &&
          !(fixedValues?.[variable.key]?.trim()) &&
          !(variable.defaultValue?.trim()) &&
          template.body.includes(`{{${variable.key}}}`)
        ) {
          missing.push(variable.labelAr);
        }
      }
    }
    if (missing.length) {
      throw new BadRequestException(
        `المتغيرات التالية مطلوبة ويجب توفير قيمتها من إعدادات النموذج: ${missing.join("، ")}`,
      );
    }

    const buffer = await this.renderTemplate(
      template as {
        body: string | null;
        variables?: TemplateVariable[] | null;
      },
      complaint as unknown as LetterComplaintSource,
      fixedValues,
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
        variableValues: fixedValues ?? undefined,
        generatedById: userId,
        createdAt: new Date(),
      },
      create: {
        complaintId,
        templateId,
        fileKey,
        variableValues: fixedValues ?? undefined,
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
      variableValues:
        (row as { variableValues?: Record<string, string> | null })
          .variableValues ?? null,
      generatedAt: row.createdAt,
    }));
  }
}