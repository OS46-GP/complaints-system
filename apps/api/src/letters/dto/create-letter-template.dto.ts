import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import type { TemplateVariable } from "../letter-context";

export const LETTER_TEMPLATE_TYPES = ["HTML"] as const;
export type LetterTemplateTypeValue = (typeof LETTER_TEMPLATE_TYPES)[number];

export class LetterTemplateVariableDto {
  @IsString()
  @IsNotEmpty({ message: "مفتاح المتغير مطلوب" })
  key!: string;

  @IsString()
  @IsNotEmpty({ message: "اسم المتغير مطلوب" })
  label!: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsIn(["text", "textarea", "date", "image"], {
    message: "نوع المتغير غير صالح",
  })
  @IsOptional()
  type?: "text" | "textarea" | "date" | "image";

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  fallbackText?: string;
}

export class CreateLetterTemplateDto {
  @IsString()
  @IsNotEmpty({ message: "اسم النموذج مطلوب" })
  @MaxLength(200, { message: "اسم النموذج يجب ألا يتجاوز 200 حرف" })
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: "الوصف يجب ألا يتجاوز 2000 حرف" })
  description?: string;

  @IsIn(LETTER_TEMPLATE_TYPES, { message: "نوع النموذج غير صالح" })
  @IsOptional()
  type?: LetterTemplateTypeValue;

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