import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'كلمة المرور الحالية مطلوبة' })
  @IsNotEmpty({ message: 'كلمة المرور الحالية مطلوبة' })
  currentPassword!: string;

  @IsString({ message: 'كلمة المرور الجديدة مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف' })
  newPassword!: string;
}
