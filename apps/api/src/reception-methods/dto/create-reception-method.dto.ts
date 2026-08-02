import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateReceptionMethodDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم طريقة الاستلام مطلوب' })
  @MaxLength(100, { message: 'اسم طريقة الاستلام يجب ألا يتجاوز 100 حرف' })
  name!: string;
}
