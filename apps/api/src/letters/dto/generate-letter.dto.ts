import { IsNotEmpty, IsString } from "class-validator";

export class GenerateLetterDto {
  @IsString()
  @IsNotEmpty({ message: "يجب اختيار نموذج الخطاب" })
  templateId!: string;
}