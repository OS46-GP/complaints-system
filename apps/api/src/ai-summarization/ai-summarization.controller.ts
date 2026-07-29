import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiSummarizationService } from "./ai-summarization.service";
import { IsDateString } from "class-validator";

class DraftReportDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiSummarizationController {
  constructor(private readonly aiSummarizationService: AiSummarizationService) {}

  @Post("summarize/:complaintId")
  summarize(@Param("complaintId") complaintId: string) {
    return this.aiSummarizationService.summarizeComplaint(complaintId);
  }

  @Post("draft-report")
  draftReport(@Body() dto: DraftReportDto) {
    return this.aiSummarizationService.draftReport(dto.from, dto.to);
  }

  @Post("draft-memo/:complaintId")
  draftMemo(@Param("complaintId") complaintId: string) {
    return this.aiSummarizationService.draftMemo(complaintId);
  }
}
