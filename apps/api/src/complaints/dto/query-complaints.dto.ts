import { IsOptional, IsString, IsInt, IsEnum, Min, IsBooleanString } from "class-validator";
import { Type } from "class-transformer";
import { Severity } from "@prisma/client";

export class QueryComplaintsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  citizenNationalId?: string;

  @IsOptional()
  @IsString()
  citizenFullName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  complaintNumber?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statementYear?: number;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  complaintTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  examinationStatusId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  receptionMethodId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  presentationStatusId?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";

  @IsOptional()
  @IsBooleanString()
  dueToday?: string;

  @IsOptional()
  @IsBooleanString()
  overdueUnresponded?: string;
}
