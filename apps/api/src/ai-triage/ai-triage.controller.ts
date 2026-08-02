import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiTriageService } from "./ai-triage.service";
import { UpdateSeverityDto } from "./dto/update-severity.dto";
import { ReindexDto } from "./dto/reindex.dto";
import { CheckDuplicatesDto } from "../complaints/dto/check-duplicates.dto";

@Controller("complaints")
@UseGuards(JwtAuthGuard)
export class AiTriageController {
  constructor(private readonly aiTriageService: AiTriageService) {}

  @Post("reindex-embeddings")
  reindexEmbeddings(@Body() dto: ReindexDto) {
    return this.aiTriageService.reindexEmbeddings(dto.limit, dto.cursor);
  }

  @Post("check-duplicates")
  checkDuplicates(@Body() dto: CheckDuplicatesDto) {
    return this.aiTriageService.checkDuplicates(dto);
  }

  @Get(":id/links")
  getLinks(@Param("id") id: string) {
    return this.aiTriageService.getLinks(id);
  }

  @Post(":id/analyze")
  analyze(@Param("id") id: string) {
    return this.aiTriageService.analyze(id);
  }

  @Patch(":id/severity")
  updateSeverity(
    @Param("id") id: string,
    @Body() dto: UpdateSeverityDto,
  ) {
    return this.aiTriageService.updateSeverity(id, dto.severity);
  }
}
