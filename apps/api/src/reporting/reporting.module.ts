import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingController } from './reporting.controller';
import { MemoController } from './memo.controller';
import { ReportingService } from './reporting.service';
import { ReportingSchedulerService } from './reporting-scheduler.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportingController, MemoController],
  providers: [ReportingService, ReportingSchedulerService],
  exports: [ReportingService],
})
export class ReportingModule {}