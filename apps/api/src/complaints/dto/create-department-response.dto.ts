import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min } from "class-validator";

export class CreateDepartmentResponseDto {
  @IsString()
  @IsNotEmpty()
  responseText!: string;

  @IsString()
  @IsNotEmpty()
  responseNumber!: string;

  @IsDateString()
  responseDate!: string;

  @IsOptional()
  @IsDateString()
  importDate?: string;

  @IsNotEmpty()
  @IsInt()
  examinationStatusId!: number;

  @IsOptional()
  @IsString()
  examinationResult?: string;

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