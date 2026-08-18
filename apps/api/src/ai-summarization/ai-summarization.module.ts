import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ReportingModule } from "../reporting/reporting.module";
import { AiSummarizationController } from "./ai-summarization.controller";
import { AiSummarizationService } from "./ai-summarization.service";

@Module({
  imports: [PrismaModule, ReportingModule],
  controllers: [AiSummarizationController],
  providers: [AiSummarizationService],
})
export class AiSummarizationModule {}
