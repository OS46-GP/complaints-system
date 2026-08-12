import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { LetterSettingsService } from "./letter-settings.service";
import { UpdateLetterSettingsDto } from "./dto/update-letter-settings.dto";

@Controller("letter-settings")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LetterSettingsController {
  constructor(private readonly settingsService: LetterSettingsService) {}

  @Roles(UserRole.Admin)
  @Get()
  find() {
    return this.settingsService.toDto();
  }

  @Roles(UserRole.Admin)
  @Patch()
  update(@Body() dto: UpdateLetterSettingsDto) {
    return this.settingsService.update(dto);
  }

  @Roles(UserRole.Admin)
  @Post("images/:field")
  @UseInterceptors(FileInterceptor("file"))
  uploadImage(
    @Param("field")
    field: "organizationLetterhead" | "managerSignature" | "seal",
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.settingsService.uploadImage(field, file);
  }
}