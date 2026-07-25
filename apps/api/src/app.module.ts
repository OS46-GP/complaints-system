import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ComplaintsModule } from "./complaints/complaints.module";
import { ReportingModule } from "./reporting/reporting.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, ComplaintsModule, ReportingModule, PrismaModule, UsersModule],
})
export class AppModule {}
