import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUrlDto {
  @IsOptional()
  @IsIn(['clicks', 'created_at', 'updated_at'])
  sort: string = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: string = 'desc';

  @IsOptional()
  @IsIn(['all', 'active', 'expired'])
  filter: string = 'all';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
