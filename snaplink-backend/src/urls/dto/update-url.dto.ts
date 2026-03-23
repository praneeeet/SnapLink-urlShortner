import { IsUrl, IsOptional, IsDateString, IsInt, Min, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUrlDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  originalUrl?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxClicks?: number | null;

  @IsOptional()
  @IsBoolean()
  isPublicStats?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
