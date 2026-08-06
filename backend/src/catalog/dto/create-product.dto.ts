import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVariantDto } from './create-variant.dto';
import { CreateImageDto } from './create-image.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsOptional()
  fabric?: string;

  @IsString()
  @IsOptional()
  occasion?: string;

  @IsNumber()
  @IsPositive()
  basePrice!: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  compareAtPrice?: number;

  @IsEnum(['draft', 'active', 'archived'])
  @IsOptional()
  status?: 'draft' | 'active' | 'archived';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants!: CreateVariantDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  images?: CreateImageDto[];
}
