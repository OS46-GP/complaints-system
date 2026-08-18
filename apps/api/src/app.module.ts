import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ComplaintsModule } from "./complaints/complaints.module";
import { ReportingModule } from "./reporting/reporting.module";
import { UsersModule } from "./users/users.module";
import { ProfileModule } from "./profile/profile.module";
import { ComplaintTypesModule } from "./complaint-types/complaint-types.module";
import { ReceptionMethodsModule } from "./reception-methods/reception-methods.module";
import { DepartmentsModule } from "./departments/departments.module";
import { AiTriageModule } from "./ai-triage/ai-triage.module";
import { AiSummarizationModule } from "./ai-summarization/ai-summarization.module";
import { SocialModule } from "./social/social.module";
import { IntakeModule } from "./intake/intake.module";
import { SettingsModule } from "./settings/settings.module";
import { LettersModule } from "./letters/letters.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { RequestLoggingMiddleware } from "./common/request-logging.middleware";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    ComplaintTypesModule,
    ReceptionMethodsModule,
    DepartmentsModule,
    ComplaintsModule,
    ReportingModule,
    AiTriageModule,
    IntakeModule,
    SocialModule,
    AiSummarizationModule,
    SettingsModule,
    LettersModule,
    NotificationsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes("*");
  }
}
