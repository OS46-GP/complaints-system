import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ComplaintsModule } from "../complaints/complaints.module";
import { SocialController } from "./social.controller";
import { SocialService } from "./social.service";
import { SocialMonitorService } from "./social-monitor.service";
import { createSocialDataSourceProvider } from "./providers";

@Module({
  imports: [PrismaModule, ComplaintsModule],
  controllers: [SocialController],
  providers: [SocialService, SocialMonitorService, createSocialDataSourceProvider()],
})
export class SocialModule {}