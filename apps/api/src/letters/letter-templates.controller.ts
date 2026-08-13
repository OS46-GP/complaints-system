import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../auth/decorators/current-user.decorator";
import { LetterTemplatesService } from "./letter-templates.service";
import { LettersService } from "./letters.service";
import { PLACEHOLDER_GROUPS } from "./letter-context";
import { CreateLetterTemplateDto } from "./dto/create-letter-template.dto";
import { UpdateLetterTemplateDto } from "./dto/update-letter-template.dto";

@Controller("letter-templates")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LetterTemplatesController {
  constructor(
    private readonly templatesService: LetterTemplatesService,
    private readonly lettersService: LettersService,
  ) {}

  @Get("placeholders")
  placeholders() {
    return PLACEHOLDER_GROUPS;
  }

  @Roles(UserRole.Admin)
  @Post("preview-draft")
  @UseInterceptors(FileInterceptor("file"))
  async previewDraft(
    @Body() body: { type?: string; body?: string },
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res() res: Response,
  ) {
    const buffer = await this.lettersService.previewDraft(
      body.type ?? "HTML",
      body.body,
      file,
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=preview.pdf");
    res.send(buffer);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query("search") search?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
    @Query("activeOnly") activeOnly?: string,
  ) {
    const forceActive =
      activeOnly === "true" || user.role !== UserRole.Admin;
    return this.templatesService.findAll(search, sortBy, sortOrder, forceActive);
  }

  @Roles(UserRole.Admin)
  @Post()
  create(@Body() dto: CreateLetterTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Roles(UserRole.Admin)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.templatesService.findById(id);
  }

  @Roles(UserRole.Admin)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateLetterTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Roles(UserRole.Admin)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.templatesService.remove(id);
  }

  @Roles(UserRole.Admin)
  @Post(":id/asset")
  @UseInterceptors(FileInterceptor("file"))
  uploadAsset(@Param("id") id: string, @UploadedFile() file: Express.Multer.File) {
    return this.templatesService.setAsset(id, file);
  }

  @Roles(UserRole.Admin)
  @Post(":id/preview")
  async preview(@Param("id") id: string, @Res() res: Response) {
    const buffer = await this.lettersService.preview(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=preview.pdf");
    res.send(buffer);
  }
}