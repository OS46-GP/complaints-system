import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IntakeService } from "./intake.service";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
  "image/bmp",
];

@Controller("intake")
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post("ocr")
  @UseInterceptors(FileInterceptor("image"))
  async ocrIntake(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Image file is required (use field name 'image')");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type '${file.mimetype}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      );
    }

    return this.intakeService.processOcr(file);
  }
}
