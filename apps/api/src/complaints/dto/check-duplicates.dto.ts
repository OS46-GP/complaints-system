import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  ValidateNested,
} from "class-validator";

class CheckDuplicatesCitizenDto {
  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  district?: string;
}

export class CheckDuplicatesDto {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CheckDuplicatesCitizenDto)
  citizen?: CheckDuplicatesCitizenDto;
}
