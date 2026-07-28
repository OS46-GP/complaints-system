import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ComplaintsService } from "./complaints.service";
import { ComplaintFilesService } from "./complaint-files.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { QueryComplaintsDto } from "./dto/query-complaints.dto";

@Controller("complaints")
@UseGuards(JwtAuthGuard)
export class ComplaintsController {
  constructor(
    private readonly complaintsService: ComplaintsService,
    private readonly filesService: ComplaintFilesService,
  ) {}

  @Post()
  create(@Body() dto: CreateComplaintDto, @Req() req: Request) {
    return this.complaintsService.create(dto, req.user as { id: string; role: string });
  }

  @Post("index")
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  indexAll() {
    return this.complaintsService.indexAll();
  }

  @Get()
  findAll(@Query() query: QueryComplaintsDto) {
    return this.complaintsService.findAll(query);
  }

  @Get("departments")
  getDepartments() {
    return this.complaintsService.getDepartments();
  }

  @Get("examination-statuses")
  getExaminationStatuses() {
    return this.complaintsService.getExaminationStatuses();
  }

  @Get("reception-methods")
  getReceptionMethods() {
    return this.complaintsService.getReceptionMethods();
  }

  @Get("complaint-types")
  getComplaintTypes() {
    return this.complaintsService.getComplaintTypes();
  }

  @Get("presentation-statuses")
  getPresentationStatuses() {
    return this.complaintsService.getPresentationStatuses();
  }

  @Post(":id/files")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("fileType") fileType: string,
  ) {
    return this.filesService.upload(id, file, fileType || "attachment");
  }

  @Get(":id/files")
  listFiles(@Param("id") id: string) {
    return this.filesService.findAll(id);
  }

  @Get(":id/files/:fileId/download")
  async downloadFile(
    @Param("id") _id: string,
    @Param("fileId") fileId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, fileRecord } = await this.filesService.getFile(fileId);

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileRecord.storageKey.split("/").pop()}"`,
    });

    return new StreamableFile(stream);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.complaintsService.findById(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(id, dto);
  }
}
