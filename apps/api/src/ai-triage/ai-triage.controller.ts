import { Controller, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiTriageService } from "./ai-triage.service";
import { UpdateSeverityDto } from "./dto/update-severity.dto";

@Controller("complaints")
@UseGuards(JwtAuthGuard)
export class AiTriageController {
  constructor(private readonly aiTriageService: AiTriageService) {}

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
