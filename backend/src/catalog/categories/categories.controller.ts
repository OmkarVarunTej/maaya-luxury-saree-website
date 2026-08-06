import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { CategoriesService } from './categories.service';

@AllowAnonymous()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('public_categories_list')
  @CacheTTL(600000) // 10 minutes in milliseconds (CacheManager v2+)
  findAll() {
    return this.categoriesService.findAllWithProductCounts();
  }
}
