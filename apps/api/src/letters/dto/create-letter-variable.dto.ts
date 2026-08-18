import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export const LETTER_VARIABLE_TYPES = [
  "text",
  "textarea",
  "date",
  "image",
] as const;
export type LetterVariableTypeValue = (typeof LETTER_VARIABLE_TYPES)[number];

export class CreateLetterVariableDto {
  @IsString()
  @IsNotEmpty({ message: "المفتاح مطلوب" })
  @MaxLength(64, { message: "المفتاح يجب ألا يتجاوز 64 حرفاً" })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.]*$/, {
    message: "المفتاح يجب أن يبدأ بحرف إنجليزي ويحتوي أرقاماً ونقاطاً وأسفل سطر فقط",
  })
  key!: string;

  @IsString()
  @IsNotEmpty({ message: "الاسم بالعربية مطلوب" })
  @MaxLength(200, { message: "الاسم يجب ألا يتجاوز 200 حرف" })
  labelAr!: string;

  @IsIn(LETTER_VARIABLE_TYPES, { message: "نوع المتغير غير صالح" })
  @IsOptional()
  type?: LetterVariableTypeValue;

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