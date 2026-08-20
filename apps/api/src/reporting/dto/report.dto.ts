import { IsOptional, IsString, IsIn, IsNumber, Min, Max, ValidateNested, IsObject, IsDateString } from "class-validator";
import { Type } from "class-transformer";

class DateRangeDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

export class AchievementQueryDto {
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(["FINISHED", "NOT_FINISHED"])
  status?: "FINISHED" | "NOT_FINISHED";

  @IsOptional()
  @IsIn(["Low", "Medium", "High"])
  severity?: "Low" | "Medium" | "High";

  @IsOptional()
  @IsString()
  search?: string;
}

export class DelayQueryDto {
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(["overdueCount", "avgDaysOverdue"])
  sortBy?: "overdueCount" | "avgDaysOverdue";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc";

  @IsOptional()
  @IsIn(["FINISHED", "NOT_FINISHED"])
  status?: "FINISHED" | "NOT_FINISHED";

  @IsOptional()
  @IsIn(["Low", "Medium", "High"])
  severity?: "Low" | "Medium" | "High";

  @IsOptional()
  @IsString()
  search?: string;
}

export class DepartmentDetailQueryDto {
  @IsString()
  department!: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(["FINISHED", "NOT_FINISHED"])
  status?: "FINISHED" | "NOT_FINISHED";

  @IsOptional()
  @IsIn(["Low", "Medium", "High"])
  severity?: "Low" | "Medium" | "High";

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 20;
}


export class CustomReportBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  examinationStatus?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 20;
}

export class CustomReportExportBodyDto extends CustomReportBodyDto {
  @IsIn(["pdf", "xlsx"])
  format!: "pdf" | "xlsx";
}

export class GenerateReportBodyDto {
  @IsIn(["ACHIEVEMENT", "DELAY"])
  type!: "ACHIEVEMENT" | "DELAY";

  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

export class ExportQueryDto {
  @IsIn(["pdf", "xlsx"])
  format!: "pdf" | "xlsx";
}

export class ScheduledReportQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
