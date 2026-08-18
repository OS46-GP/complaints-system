import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { LETTER_VARIABLE_TYPES } from "./create-letter-variable.dto";

export class UpdateLetterVariableDto {
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: "الاسم يجب ألا يتجاوز 200 حرف" })
  labelAr?: string;

  @IsIn(LETTER_VARIABLE_TYPES, { message: "نوع المتغير غير صالح" })
  @IsOptional()
  type?: (typeof LETTER_VARIABLE_TYPES)[number];

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: "القيمة الافتراضية يجب ألا تتجاوز 2000 حرف" })
  defaultValue?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: "رابط الصورة يجب ألا يتجاوز 500 حرف" })
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: "النص الاحتياطي يجب ألا يتجاوز 500 حرف" })
  fallbackText?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}