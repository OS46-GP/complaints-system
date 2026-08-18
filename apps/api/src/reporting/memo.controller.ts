import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('complaints')
@UseGuards(JwtAuthGuard)
export class MemoController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post(':id/memo')
  async generateMemo(@Param('id') id: string) {
    const result = await this.reportingService.generateMemo(id);
    return {
      downloadUrl: result.downloadUrl,
      filename: result.filename,
      mime: result.mime,
    };
  }

  @Post(':id/pdf')
  async generateComplaintPdf(@Param('id') id: string) {
    const result = await this.reportingService.generateComplaintPdf(id);
    return {
      downloadUrl: result.downloadUrl,
      filename: result.filename,
      mime: result.mime,
    };
  }
}
