import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { AdminCategoriesController } from './admin/admin-categories.controller';
import { AdminCategoriesService } from './admin/admin-categories.service';
import { AdminProductsController } from './admin/admin-products.controller';
import { AdminProductsService } from './admin/admin-products.service';
import { BulkImportService } from './admin/bulk-import.service';
import type { EnvConfig } from '../config/env.validation';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService<EnvConfig, true>) => {
        const store = await redisStore({
          url: config.get('REDIS_URL', { infer: true }),
        });
        return { store };
      },
    }),
  ],
  controllers: [
    CategoriesController,
    ProductsController,
    AdminCategoriesController,
    AdminProductsController,
  ],
  providers: [
    CategoriesService,
    ProductsService,
    AdminCategoriesService,
    AdminProductsService,
    BulkImportService,
  ],
  exports: [
    CategoriesService,
    ProductsService,
  ],
})
export class CatalogModule {}
