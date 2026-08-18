import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordResetRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'National ID is required' })
  nationalId!: string;
}
