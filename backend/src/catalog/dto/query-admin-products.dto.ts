import { IsOptional, IsString } from 'class-validator';

export class QueryAdminProductsDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  perPage?: string;
}
