import { Injectable, NotFoundException } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { uploadRoot } from "./letter-context";
import { UpdateLetterSettingsDto } from "./dto/update-letter-settings.dto";

export const LETTER_SETTING_IMAGE_FIELDS = [
  "managerSignature",
  "seal",
] as const;
export type LetterSettingImageField = (typeof LETTER_SETTING_IMAGE_FIELDS)[number];

const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MB = 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * MB;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF.]/g, "_");
}

@Injectable()
export class LetterSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate() {
    return this.prisma.client.letterSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  async toDto() {
    const settings = await this.getOrCreate();
    const imageUrl = (key: string) =>
      settings[key as LetterSettingImageField]
        ? `/uploads/${settings[key as LetterSettingImageField]}`
        : null;
    return {
      ...settings,
      managerSignatureUrl: imageUrl("managerSignature"),
      sealUrl: imageUrl("seal"),
    };
  }

  async update(dto: UpdateLetterSettingsDto) {
    await this.getOrCreate();
    return this.prisma.client.letterSettings.update({
      where: { id: 1 },
      data: dto,
    });
  }

  async uploadImage(field: LetterSettingImageField, file: Express.Multer.File) {
    if (!LETTER_SETTING_IMAGE_FIELDS.includes(field)) {
      throw new NotFoundException("حقل الصورة غير صالح");
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      throw new NotFoundException("امتداد الصورة غير مدعوم (png, jpg, jpeg, webp)");
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new NotFoundException("حجم الصورة يتجاوز 5 ميجابايت");
    }

    const safeName = sanitizeFilename(`${field}${ext}`);
    const storageKey = `letter-settings/${safeName}`;
    const dir = path.resolve(uploadRoot(), "letter-settings");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.resolve(uploadRoot(), storageKey), file.buffer);

    await this.getOrCreate();
    const settings = await this.prisma.client.letterSettings.update({
      where: { id: 1 },
      data: { [field]: storageKey },
    });

    return {
      field,
      storageKey,
      downloadUrl: `/uploads/${storageKey}`,
      ...settings,
    };
  }

  async removeImage(field: LetterSettingImageField) {
    if (!LETTER_SETTING_IMAGE_FIELDS.includes(field)) {
      throw new NotFoundException("حقل الصورة غير صالح");
    }

    const settings = await this.getOrCreate();
    const storageKey = settings[field];
    if (storageKey) {
      const fullPath = path.resolve(uploadRoot(), storageKey);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      await this.prisma.client.letterSettings.update({
        where: { id: 1 },
        data: { [field]: null },
      });
    }

    return this.toDto();
  }
}