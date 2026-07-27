import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ReportingService } from "./reporting.service";

@Injectable()
export class ReportingSchedulerService {
  private readonly logger = new Logger(ReportingSchedulerService.name);

  constructor(private readonly reportingService: ReportingService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyReports() {
    this.logger.log("Generating daily scheduled reports...");
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      await this.reportingService.generateAndPersistReport(
        "ACHIEVEMENT",
        from.toISOString(),
        to.toISOString(),
      );
      await this.reportingService.generateAndPersistReport(
        "DELAY",
        from.toISOString(),
        to.toISOString(),
      );
      this.logger.log("Daily reports generated successfully.");
    } catch (error) {
      this.logger.error("Failed to generate daily reports", error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async generateWeeklyReports() {
    this.logger.log("Generating weekly scheduled reports...");
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    const to = now;

    try {
      await this.reportingService.generateAndPersistReport(
        "ACHIEVEMENT",
        from.toISOString(),
        to.toISOString(),
      );
      await this.reportingService.generateAndPersistReport(
        "DELAY",
        from.toISOString(),
        to.toISOString(),
      );
      this.logger.log("Weekly reports generated successfully.");
    } catch (error) {
      this.logger.error("Failed to generate weekly reports", error);
    }
  }
}
