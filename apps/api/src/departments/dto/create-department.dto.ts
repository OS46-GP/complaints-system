import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الجهة مطلوب' })
  @MaxLength(200, { message: 'اسم الجهة يجب ألا يتجاوز 200 حرف' })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'الجهة الفرعية يجب ألا تتجاوز 200 حرف' })
  subAuthority?: string;
}
