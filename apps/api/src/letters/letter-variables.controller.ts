import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { LetterVariablesService } from "./letter-variables.service";
import { CreateLetterVariableDto } from "./dto/create-letter-variable.dto";
import { UpdateLetterVariableDto } from "./dto/update-letter-variable.dto";

@Controller("letter-variables")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LetterVariablesController {
  constructor(private readonly variablesService: LetterVariablesService) {}

  @Get()
  findAll(@Query("activeOnly") activeOnly?: string) {
    return this.variablesService.findAll(activeOnly !== "false");
  }

  @Roles(UserRole.Admin)
  @Post("images")
  @UseInterceptors(FileInterceptor("file"))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.variablesService.uploadImage(file);
  }

  @Roles(UserRole.Admin)
  @Post()
  create(@Body() dto: CreateLetterVariableDto) {
    return this.variablesService.create(dto);
  }

  @Roles(UserRole.Admin)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateLetterVariableDto) {
    return this.variablesService.update(id, dto);
  }

  @Roles(UserRole.Admin)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.variablesService.remove(id);
  }
}

