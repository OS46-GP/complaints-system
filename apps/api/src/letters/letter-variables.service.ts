import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLetterVariableDto } from "./dto/create-letter-variable.dto";
import { UpdateLetterVariableDto } from "./dto/update-letter-variable.dto";
import { uploadRoot } from "./letter-context";

const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.]*$/;

const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MB = 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * MB;

@Injectable()
export class LetterVariablesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    return this.prisma.client.letterVariable.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    const row = await this.prisma.client.letterVariable.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException("المتغير غير موجود");
    }
    return row;
  }

  async create(dto: CreateLetterVariableDto) {
    const key = dto.key.trim();
    if (!KEY_PATTERN.test(key)) {
      throw new BadRequestException(
        "المفتاح يجب أن يبدأ بحرف إنجليزي ويحتوي أرقاماً ونقاطاً وأسفل سطر فقط",
      );
    }
    const existing = await this.prisma.client.letterVariable.findUnique({
      where: { key },
    });
    if (existing) {
      throw new ConflictException("هذا المفتاح مستخدم مسبقاً");
    }
    return this.prisma.client.letterVariable.create({
      data: {
        key,
        labelAr: dto.labelAr.trim(),
        type: dto.type ?? "text",
        defaultValue: dto.defaultValue?.trim() || undefined,
        imageUrl: dto.imageUrl?.trim() || undefined,
        fallbackText: dto.fallbackText?.trim() || undefined,
        required: dto.required ?? false,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateLetterVariableDto) {
    const existing = await this.findById(id);
    const data: Record<string, unknown> = {};
    if (dto.labelAr !== undefined) data.labelAr = dto.labelAr.trim();
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.defaultValue !== undefined)
      data.defaultValue = dto.defaultValue?.trim() || null;
    if (dto.imageUrl !== undefined)
      data.imageUrl = dto.imageUrl?.trim() || null;
    if (dto.fallbackText !== undefined)
      data.fallbackText = dto.fallbackText?.trim() || null;
    if (dto.required !== undefined) data.required = dto.required;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.client.letterVariable.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.findById(id);
    if (existing.isSystem) {
      throw new ConflictException(
        "لا يمكن حذف المتغيرات الأساسية (النظامية) المرتبطة ببيانات الشكوى",
      );
    }

    const usage = await this.prisma.client.letterTemplate.findMany({
      where: { body: { contains: `{{${existing.key}}}` } },
      select: { id: true, name: true },
    });
    if (usage.length > 0) {
      throw new ConflictException(
        `لا يمكن حذف المتغير لأنه مستخدم في ${usage.length} نموذج خطاب (${usage
          .slice(0, 3)
          .map((t) => t.name)
          .join("، ")}${usage.length > 3 ? "..." : ""})`,
      );
    }

    await this.prisma.client.letterVariable.delete({ where: { id } });
    return { success: true };
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("يجب اختيار صورة أولاً");
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        "امتداد الصورة غير مدعوم (png, jpg, jpeg, webp)",
      );
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException("حجم الصورة يتجاوز 5 ميجابايت");
    }

    const storageKey = `letter-variables/${randomUUID()}${ext}`;
    const dir = path.resolve(uploadRoot(), "letter-variables");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.resolve(uploadRoot(), storageKey), file.buffer);

    return {
      storageKey,
      downloadUrl: `/uploads/${storageKey}`,
    };
  }
}