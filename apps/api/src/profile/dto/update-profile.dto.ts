import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'الاسم الكامل يجب أن يكون نصاً' })
  @MaxLength(200, { message: 'الاسم الكامل يجب ألا يتجاوز 200 حرف' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'البريد الإلكتروني يجب أن يكون نصاً' })
  @MaxLength(200, { message: 'البريد الإلكتروني يجب ألا يتجاوز 200 حرف' })
  email?: string;
}
