import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class GenerateLetterDto {
  @IsString()
  @IsNotEmpty({ message: "يجب اختيار نموذج الخطاب" })
  templateId!: string;

  @IsObject()
  @IsOptional()
  variableValues?: Record<string, string>;
}