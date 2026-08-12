import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export const LETTER_TEMPLATE_TYPES = ["HTML", "DOCX", "PDF_LETTERHEAD"] as const;
export type LetterTemplateTypeValue = (typeof LETTER_TEMPLATE_TYPES)[number];

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
  type!: LetterTemplateTypeValue;

  @IsString()
  @IsOptional()
  body?: string;

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