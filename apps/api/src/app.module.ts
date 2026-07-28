import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ComplaintsModule } from "./complaints/complaints.module";
import { ReportingModule } from "./reporting/reporting.module";
import { UsersModule } from "./users/users.module";
import { AiTriageModule } from "./ai-triage/ai-triage.module";
import { AgentModule } from "./agents/agent.module";
import { MastraModule } from "@mastra/nestjs";
import { mastra } from "./agents/mastra.config";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ComplaintsModule,
    ReportingModule,
    AiTriageModule,
    AgentModule,
    MastraModule.register({ mastra }),
  ],
})
export class AppModule {}
