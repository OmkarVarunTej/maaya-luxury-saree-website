import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  color!: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsInt()
  @IsOptional()
  stock?: number;
}
