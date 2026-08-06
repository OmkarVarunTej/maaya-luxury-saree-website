import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AdminProductsService } from './admin-products.service';
import { BulkImportService } from './bulk-import.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';
import { CreateImageDto } from '../dto/create-image.dto';
import { QueryAdminProductsDto } from '../dto/query-admin-products.dto';

const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — generous for a few thousand SKU rows

@AllowAnonymous()
@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly bulkImportService: BulkImportService,
  ) {}

  @Get('products')
  findAll(@Query() query: QueryAdminProductsDto) {
    return this.adminProductsService.findAll(query);
  }

  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.adminProductsService.findOne(id);
  }

  @Post('products')
  create(@Body() dto: CreateProductDto) {
    return this.adminProductsService.create(dto);
  }

  @Patch('products/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminProductsService.update(id, dto);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.adminProductsService.remove(id);
  }

  // --- Variants -------------------------------------------------------

  @Post('products/:id/variants')
  addVariant(@Param('id') productId: string, @Body() dto: CreateVariantDto) {
    return this.adminProductsService.addVariant(productId, dto);
  }

  @Patch('variants/:variantId')
  updateVariant(@Param('variantId') variantId: string, @Body() dto: UpdateVariantDto) {
    return this.adminProductsService.updateVariant(variantId, dto);
  }

  @Delete('variants/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVariant(@Param('variantId') variantId: string) {
    await this.adminProductsService.removeVariant(variantId);
  }

  // --- Images -----------------------------------------------------------

  @Post('products/:id/images')
  addImage(@Param('id') productId: string, @Body() dto: CreateImageDto) {
    return this.adminProductsService.addImage(productId, dto);
  }

  @Delete('images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeImage(@Param('imageId') imageId: string) {
    await this.adminProductsService.removeImage(imageId);
  }

  // --- Bulk import --------------------------------------------------------

  @Post('products/bulk-import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_CSV_SIZE_BYTES } }))
  bulkImport(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Upload a CSV file under the "file" field.',
      });
    }
    if (!file.originalname.toLowerCase().endsWith('.csv') && file.mimetype !== 'text/csv') {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'File must be a .csv file.' });
    }
    return this.bulkImportService.import(file.buffer);
  }
}
