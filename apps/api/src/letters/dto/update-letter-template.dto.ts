import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { LETTER_TEMPLATE_TYPES } from "./create-letter-template.dto";
import { LetterTemplateVariableDto } from "./create-letter-template.dto";

export class UpdateLetterTemplateDto {
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: "اسم النموذج يجب ألا يتجاوز 200 حرف" })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: "الوصف يجب ألا يتجاوز 2000 حرف" })
  description?: string;

  @IsIn(LETTER_TEMPLATE_TYPES, { message: "نوع النموذج غير صالح" })
  @IsOptional()
  type?: (typeof LETTER_TEMPLATE_TYPES)[number];

  @IsString()
  @IsOptional()
  body?: string;

  @IsArray()
  @Type(() => LetterTemplateVariableDto)
  @IsOptional()
  variables?: LetterTemplateVariableDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}