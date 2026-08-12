import { IsString, IsNotEmpty, IsDateString } from "class-validator";

export class CreateUrgencyDto {
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsString()
  @IsNotEmpty()
  outgoingLetterNumber!: string;

  @IsDateString()
  outgoingLetterDate!: string;
}