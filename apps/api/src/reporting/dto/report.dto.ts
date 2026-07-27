import { IsOptional, IsString, IsIn, IsNumber, Min, ValidateNested, IsObject, IsDateString } from "class-validator";
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
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class DelayQueryDto {
  @IsOptional()
  @IsString()
  department?: string;

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
