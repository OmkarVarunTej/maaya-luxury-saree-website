import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ProductsService } from './products.service';
import { QueryProductsDto } from '../dto/query-products.dto';

@AllowAnonymous()
@Controller('products')
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @CacheTTL(90000) // 90 seconds in milliseconds (CacheManager v2+)
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAllPublic(query);
  }

  @Get(':slug')
  @CacheTTL(300000) // 5 minutes in milliseconds (CacheManager v2+)
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOnePublic(slug);
  }

  @Get(':slug/related')
  @CacheTTL(300000) // 5 minutes in milliseconds (CacheManager v2+)
  findRelated(@Param('slug') slug: string) {
    return this.productsService.findRelatedPublic(slug);
  }
}
