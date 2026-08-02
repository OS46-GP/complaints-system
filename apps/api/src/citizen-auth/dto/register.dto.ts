import { IsString, IsNotEmpty, IsEmail, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{14}$/, { message: 'National ID must be exactly 14 digits' })
  nationalId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^01[0125][0-9]{8}$/, { message: 'Must be a valid Egyptian mobile number' })
  mobileNumber!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  district?: string;
}
