import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateLetterSettingsDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  organizationNameAr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  organizationNameEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  organizationAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  organizationPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  organizationFax?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  organizationEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  organizationWebsite?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  managerName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  managerTitle?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  responseDefaultDays?: number;
}