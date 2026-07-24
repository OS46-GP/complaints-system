import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ComplaintsModule } from "./complaints/complaints.module";
import { ReportingModule } from "./reporting/reporting.module";

@Module({
  imports: [AuthModule, ComplaintsModule, ReportingModule],
})
export class AppModule {}
