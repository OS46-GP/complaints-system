import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AchievementQueryDto,
  DelayQueryDto,
  CustomReportBodyDto,
  CustomReportExportBodyDto,
  GenerateReportBodyDto,
  ExportQueryDto,
  ScheduledReportQueryDto,
  DepartmentDetailQueryDto,
} from './dto/report.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('achievement')
  async getAchievement(@Query() query: AchievementQueryDto) {
    return this.reportingService.getAchievementReport(
      query.department,
      query.from,
      query.to,
      query.village,
      query.status,
      query.severity,
      query.search,
      false,
    );
  }

  @Get('achievement/department')
  async getAchievementDepartment(@Query() query: DepartmentDetailQueryDto) {
    return this.reportingService.getAchievementDepartmentComplaints(
      query.department,
      query.from,
      query.to,
      query.village,
      query.status,
      query.severity,
      query.search,
    );
  }

  @Get('delays')
  async getDelays(@Query() query: DelayQueryDto) {
    return this.reportingService.getDelayReport(
      query.department,
      query.from,
      query.to,
      query.village,
      query.sortBy,
      query.order,
      query.status,
      query.severity,
      query.search,
      false,
    );
  }

  @Get('delays/department')
  async getDelaysDepartment(@Query() query: DepartmentDetailQueryDto) {
    return this.reportingService.getDelayDepartmentComplaints(
      query.department,
      query.from,
      query.to,
      query.village,
      query.status,
      query.severity,
      query.search,
    );
  }

  @Post('custom')
  async customReport(@Body() body: CustomReportBodyDto) {
    return this.reportingService.getCustomReport(body);
  }

  @Post('custom/export')
  async exportCustom(
    @Body() body: CustomReportExportBodyDto,
  ) {
    const result = await this.reportingService.exportCustomReport(
      {
        dateRange: body.dateRange,
        village: body.village,
        department: body.department,
        examinationStatus: body.examinationStatus,
      },
      body.format,
    );
    return {
      downloadUrl: result.downloadUrl,
      filename: result.filename,
      mime: result.mime,
    };
  }

  @Get('scheduled')
  async listScheduled(@Query() query: ScheduledReportQueryDto) {
    return this.reportingService.getScheduledReports(
      query.type,
      query.page,
      query.limit,
    );
  }

  @Post('generate')
  async generate(@Body() body: GenerateReportBodyDto) {
    return this.reportingService.generateAndPersistReport(
      body.type,
      body.from,
      body.to,
    );
  }

  @Get(':id/export')
  async export(
    @Param('id') id: string,
    @Query() query: ExportQueryDto,
  ) {
    const result = await this.reportingService.exportReport(id, query.format);
    return {
      downloadUrl: result.downloadUrl,
      filename: result.filename,
      mime: result.mime,
    };
  }
}
