import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { clampPagination } from '../../common/utils/pagination.util';
import { slugify, withUniqueSuffix } from '../../common/utils/slug.util';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';
import { CreateImageDto } from '../dto/create-image.dto';
import { QueryAdminProductsDto } from '../dto/query-admin-products.dto';

const FULL_PRODUCT_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  variants: { orderBy: [{ color: 'asc' as const }, { size: 'asc' as const }] },
  images: { orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] },
} satisfies Prisma.ProductInclude;

const FK_CONSTRAINT_VIOLATION = 'P2003';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryAdminProductsDto) {
    const { page, perPage, skip, take } = clampPagination(query.page, query.perPage);

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status as Prisma.EnumProductStatusFilter | undefined } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: FULL_PRODUCT_INCLUDE,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, page, perPage, total };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: FULL_PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found.' });
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    await this.assertCategoryExists(dto.categoryId);

    const baseSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const slug = (await this.slugTaken(baseSlug)) ? withUniqueSuffix(baseSlug) : baseSlug;

    try {
      return await this.prisma.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          categoryId: dto.categoryId,
          fabric: dto.fabric,
          occasion: dto.occasion,
          basePrice: dto.basePrice,
          compareAtPrice: dto.compareAtPrice,
          status: dto.status ?? 'draft',
          variants: {
            create: dto.variants.map((v) => ({
              sku: v.sku,
              color: v.color,
              size: v.size ?? 'Free Size',
              price: v.price,
              stock: v.stock ?? 0,
            })),
          },
          images: dto.images?.length
            ? { create: this.normalizeImages(dto.images) }
            : undefined,
        },
        include: FULL_PRODUCT_INCLUDE,
      });
    } catch (error) {
      throw this.translateWriteError(error, 'variant SKU');
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id); // 404s if missing/soft-deleted

    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const data: Prisma.ProductUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.slug !== undefined ? { slug: slugify(dto.slug) } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.categoryId !== undefined ? { category: { connect: { id: dto.categoryId } } } : {}),
      ...(dto.fabric !== undefined ? { fabric: dto.fabric } : {}),
      ...(dto.occasion !== undefined ? { occasion: dto.occasion } : {}),
      ...(dto.basePrice !== undefined ? { basePrice: dto.basePrice } : {}),
      ...(dto.compareAtPrice !== undefined ? { compareAtPrice: dto.compareAtPrice } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };

    try {
      return await this.prisma.product.update({ where: { id }, data, include: FULL_PRODUCT_INCLUDE });
    } catch (error) {
      throw this.translateWriteError(error, 'slug');
    }
  }

  /** Soft delete — `deletedAt` is set, the row (and its order history) stays intact. */
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // --- Variants -------------------------------------------------------

  async addVariant(productId: string, dto: CreateVariantDto) {
    await this.findOne(productId);

    try {
      return await this.prisma.productVariant.create({
        data: {
          productId,
          sku: dto.sku,
          color: dto.color,
          size: dto.size ?? 'Free Size',
          price: dto.price,
          stock: dto.stock ?? 0,
        },
      });
    } catch (error) {
      throw this.translateWriteError(error, 'SKU or color/size combination');
    }
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    await this.assertVariantExists(variantId);

    try {
      return await this.prisma.productVariant.update({
        where: { id: variantId },
        data: {
          ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
          ...(dto.size !== undefined ? { size: dto.size } : {}),
          ...(dto.price !== undefined ? { price: dto.price } : {}),
          ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        },
      });
    } catch (error) {
      throw this.translateWriteError(error, 'SKU or color/size combination');
    }
  }

  async removeVariant(variantId: string) {
    await this.assertVariantExists(variantId);

    try {
      await this.prisma.productVariant.delete({ where: { id: variantId } });
    } catch (error) {
      throw this.translateWriteError(
        error,
        'variant — it has existing cart or order history and cannot be deleted',
      );
    }
  }

  // --- Images -----------------------------------------------------------

  async addImage(productId: string, dto: CreateImageDto) {
    await this.findOne(productId);

    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        url: dto.url,
        sortOrder: dto.sortOrder ?? 0,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  async removeImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Image not found.' });
    }
    await this.prisma.productImage.delete({ where: { id: imageId } });
  }

  // --- Shared helpers -----------------------------------------------------

  private normalizeImages(images: CreateImageDto[]): Prisma.ProductImageCreateWithoutProductInput[] {
    // Only one primary image per product — if the caller sent several, keep
    // the first and demote the rest rather than reject the whole request.
    let primarySeen = false;
    return images.map((img) => {
      const isPrimary = Boolean(img.isPrimary) && !primarySeen;
      if (isPrimary) primarySeen = true;
      return { url: img.url, sortOrder: img.sortOrder ?? 0, isPrimary };
    });
  }

  private async slugTaken(slug: string): Promise<boolean> {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    return existing !== null;
  }

  private async assertCategoryExists(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Category not found.' });
    }
  }

  private async assertVariantExists(id: string): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Variant not found.' });
    }
  }

  private translateWriteError(error: unknown, contextInfo: string) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: `A product or variant with this ${contextInfo} already exists.`,
        });
      }
      if (error.code === FK_CONSTRAINT_VIOLATION) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: `Foreign key constraint failed on ${contextInfo}.`,
        });
      }
    }
    return error;
  }
}
