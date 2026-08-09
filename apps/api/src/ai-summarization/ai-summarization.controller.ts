import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiSummarizationService } from "./ai-summarization.service";
import { IsDateString, IsArray, IsString, ArrayNotEmpty } from "class-validator";

class DraftReportDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

class ComplaintIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  complaintIds!: string[];
}

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiSummarizationController {
  constructor(private readonly aiSummarizationService: AiSummarizationService) {}

  @Post("summarize/:complaintId")
  summarize(@Param("complaintId") complaintId: string) {
    return this.aiSummarizationService.summarizeComplaint(complaintId);
  }

  @Post("summarize-batch")
  summarizeBatch(@Body() dto: ComplaintIdsDto) {
    return this.aiSummarizationService.summarizeComplaints(dto.complaintIds);
  }

  @Post("draft-report")
  draftReport(@Body() dto: DraftReportDto) {
    return this.aiSummarizationService.draftReport(dto.from, dto.to);
  }

  @Post("draft-selection-report")
  draftSelectionReport(@Body() dto: ComplaintIdsDto) {
    return this.aiSummarizationService.draftSelectionReport(dto.complaintIds);
  }
}