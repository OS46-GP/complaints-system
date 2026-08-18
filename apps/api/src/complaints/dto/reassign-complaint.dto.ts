import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min } from "class-validator";

export class ReassignComplaintDto {
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsOptional()
  @IsString()
  outgoingLetterNumber?: string;

  @IsOptional()
  @IsDateString()
  outgoingLetterDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  responseDeadlineDays?: number;
}