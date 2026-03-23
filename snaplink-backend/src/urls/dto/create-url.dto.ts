import { IsUrl, IsOptional, MaxLength, MinLength, Matches, IsDateString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUrlDto {
  @IsUrl({ require_protocol: true })
  originalUrl!: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9-_]+$/)
  customAlias?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxClicks?: number;

  @IsOptional()
  @IsBoolean()
  isPublicStats?: boolean;

  @IsOptional()
  @MaxLength(255)
  title?: string;
}
