import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as mammoth from "mammoth";
import * as path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLetterTemplateDto } from "./dto/create-letter-template.dto";
import { UpdateLetterTemplateDto } from "./dto/update-letter-template.dto";

@Injectable()
export class LetterTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLetterTemplateDto) {
    const existing = await this.prisma.client.letterTemplate.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException("اسم النموذج موجود مسبقاً");
    }
    const { variables, ...rest } = dto;
    return this.prisma.client.letterTemplate.create({
      data: {
        ...rest,
        ...(variables
          ? { variables: variables.map((v) => ({ ...v })) }
          : {}),
      },
    });
  }

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    activeOnly = false,
  ) {
    const validSortFields = ["name", "sortOrder", "createdAt"];
    const orderBy =
      sortBy && validSortFields.includes(sortBy)
        ? { [sortBy]: sortOrder === "desc" ? "desc" : "asc" }
        : { sortOrder: "asc" as const };

    return this.prisma.client.letterTemplate.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy,
    });
  }

  async findById(id: string) {
    const template = await this.prisma.client.letterTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException("النموذج غير موجود");
    }
    return template;
  }

  async update(id: string, dto: UpdateLetterTemplateDto) {
    await this.findById(id);
    const { variables, ...rest } = dto;
    return this.prisma.client.letterTemplate.update({
      where: { id },
      data: {
        ...rest,
        ...(variables
          ? { variables: variables.map((v) => ({ ...v })) }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    const usageCount = await this.prisma.client.letterGeneration.count({
      where: { templateId: id },
    });
    if (usageCount > 0) {
      throw new ConflictException(
        `لا يمكن حذف النموذج لأنه مستخدم في ${usageCount} خطاب صادر`,
      );
    }

    const template = await this.prisma.client.letterTemplate.delete({
      where: { id },
    });
    return { success: true };
  }

  async importDocx(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("اختر ملف DOCX أولاً");
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".docx") {
      throw new BadRequestException(
        "امتداد الملف غير مدعوم (يُقبل .docx فقط)",
      );
    }
    const result = await mammoth.convertToHtml(
      { buffer: file.buffer },
      {
        convertImage: mammoth.images.imgElement((image) =>
          image.read("base64").then((base64) => {
            const mime = image.contentType ?? "image/png";
            return { src: `data:${mime};base64,${base64}` };
          }),
        ),
      },
    );
    if (result.messages.some((m) => m.type === "error")) {
      throw new BadRequestException("تعذر قراءة ملف DOCX");
    }
    return { html: result.value };
  }
}