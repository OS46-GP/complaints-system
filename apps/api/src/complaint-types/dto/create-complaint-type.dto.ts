import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateComplaintTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الفئة مطلوب' })
  @MaxLength(100, { message: 'اسم الفئة يجب ألا يتجاوز 100 حرف' })
  name!: string;
}
