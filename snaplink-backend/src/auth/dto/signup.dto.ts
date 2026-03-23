import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsOptional()
  @MaxLength(50)
  name?: string;
}
