import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ComplaintsModule } from "./complaints/complaints.module";
import { ReportingModule } from "./reporting/reporting.module";
import { UsersModule } from "./users/users.module";
import { ComplaintTypesModule } from "./complaint-types/complaint-types.module";
import { AiTriageModule } from "./ai-triage/ai-triage.module";
import { AiSummarizationModule } from "./ai-summarization/ai-summarization.module";
import { SocialModule } from "./social/social.module";
import { MastraModule } from "@mastra/nestjs";
import { mastra } from "./ai-summarization/mastra.config";
import { IntakeModule } from "./intake/intake.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ComplaintTypesModule,
    ComplaintsModule,
    ReportingModule,
    AiTriageModule,
    IntakeModule,
    SocialModule,
    AiSummarizationModule,
    MastraModule.register({ mastra }),
  ],
})
export class AppModule {}
