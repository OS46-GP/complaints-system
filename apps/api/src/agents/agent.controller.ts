import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AgentService } from "./agent.service";
import { IsDateString, IsOptional } from "class-validator";

class DraftReportDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

@Controller("agents")
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * POST /api/agents/summarize/:complaintId
   * Returns a plain-language Arabic summary of the complaint as a draft.
   */
  @Post("summarize/:complaintId")
  summarize(@Param("complaintId") complaintId: string) {
    return this.agentService.summarizeComplaint(complaintId);
  }

  /**
   * POST /api/agents/draft-report
   * Body: { from: "2026-01-01", to: "2026-07-01" }
   * Returns a draft periodic report in Arabic.
   */
  @Post("draft-report")
  draftReport(@Body() dto: DraftReportDto) {
    return this.agentService.draftReport(dto.from, dto.to);
  }

  /**
   * POST /api/agents/draft-memo/:complaintId
   * Returns a draft formal Arabic letter/memo for the complaint.
   */
  @Post("draft-memo/:complaintId")
  draftMemo(@Param("complaintId") complaintId: string) {
    return this.agentService.draftMemo(complaintId);
  }
}
