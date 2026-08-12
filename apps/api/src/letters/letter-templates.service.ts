import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { uploadRoot } from "./letter-context";
import { CreateLetterTemplateDto } from "./dto/create-letter-template.dto";
import { UpdateLetterTemplateDto } from "./dto/update-letter-template.dto";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF.]/g, "_");
}

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
    return this.prisma.client.letterTemplate.create({ data: dto });
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
    return this.prisma.client.letterTemplate.update({
      where: { id },
      data: dto,
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
    if (template.assetKey) {
      try {
        fs.unlinkSync(path.resolve(uploadRoot(), template.assetKey));
      } catch {
        // ignore missing asset file
      }
    }
    return { success: true };
  }

  async setAsset(id: string, file: Express.Multer.File) {
    await this.findById(id);

    const safeName = sanitizeFilename(file.originalname);
    const storageKey = `letter-templates/${id}_${Date.now()}_${safeName}`;
    const dir = path.resolve(uploadRoot(), "letter-templates");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.resolve(uploadRoot(), storageKey), file.buffer);

    const old = await this.prisma.client.letterTemplate.findUnique({
      where: { id },
    });
    if (old?.assetKey) {
      try {
        fs.unlinkSync(path.resolve(uploadRoot(), old.assetKey));
      } catch {
        // ignore missing old asset
      }
    }

    const updated = await this.prisma.client.letterTemplate.update({
      where: { id },
      data: { assetKey: storageKey },
    });
    return {
      id: updated.id,
      assetKey: updated.assetKey,
      downloadUrl: `/uploads/${storageKey}`,
    };
  }
}