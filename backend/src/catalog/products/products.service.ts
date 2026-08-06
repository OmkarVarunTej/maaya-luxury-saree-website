import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { clampPagination } from '../../common/utils/pagination.util';
import { QueryProductsDto } from '../dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic(query: QueryProductsDto) {
    const { page, perPage, skip, take } = clampPagination(query.page, query.perPage);

    const where: Prisma.ProductWhereInput = {
      status: 'active',
      deletedAt: null,
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.fabric ? { fabric: { equals: query.fabric, mode: 'insensitive' } } : {}),
      ...(query.occasion ? { occasion: { equals: query.occasion, mode: 'insensitive' } } : {}),
    };

    // Price filtering
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (query.minPrice !== undefined) {
        const min = parseFloat(query.minPrice);
        if (!isNaN(min)) {
          priceFilter.gte = min;
        }
      }
      if (query.maxPrice !== undefined) {
        const max = parseFloat(query.maxPrice);
        if (!isNaN(max)) {
          priceFilter.lte = max;
        }
      }
      where.basePrice = priceFilter;
    }

    // Search filtering
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { fabric: { contains: query.search, mode: 'insensitive' } },
        { occasion: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { basePrice: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { basePrice: 'desc' };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: { select: { id: true, slug: true, name: true } },
          variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, page, perPage, total };
  }

  async findOnePublic(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'active', deletedAt: null },
      include: {
        category: { select: { id: true, slug: true, name: true } },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });

    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found.' });
    }

    return product;
  }

  async findRelatedPublic(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'active', deletedAt: null },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found.' });
    }

    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'active',
        deletedAt: null,
      },
      take: 4,
      include: {
        category: { select: { id: true, slug: true, name: true } },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
