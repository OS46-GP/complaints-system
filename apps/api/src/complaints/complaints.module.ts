import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AiTriageModule } from "../ai-triage/ai-triage.module";
import { ComplaintsController } from "./complaints.controller";
import { ComplaintsService } from "./complaints.service";
import { ComplaintFilesService } from "./complaint-files.service";

@Module({
  imports: [PrismaModule, AiTriageModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, ComplaintFilesService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
