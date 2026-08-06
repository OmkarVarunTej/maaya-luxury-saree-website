import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { PrismaService } from '../../database/prisma.service';
import { slugify } from '../../common/utils/slug.util';

interface BulkImportVariant {
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
}

interface BulkImportProduct {
  name: string;
  slug: string;
  description?: string;
  categorySlug: string;
  categoryName: string;
  fabric?: string;
  occasion?: string;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrl?: string;
}

@Injectable()
export class BulkImportService {
  constructor(private readonly prisma: PrismaService) {}

  async import(buffer: Buffer) {
    let records: Record<string, string>[];
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Failed to parse CSV file. Ensure it is valid CSV.',
      });
    }

    if (!records.length) {
      return { importedProducts: 0, importedVariants: 0 };
    }

    // Group variants by product slug/name
    const productsMap = new Map<
      string,
      {
        productData: BulkImportProduct;
        variants: BulkImportVariant[];
      }
    >();

    for (const record of records) {
      const name = record.name || record.productName || record.Product_Name || record.product_name;
      if (!name) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'CSV contains a row missing product name.',
        });
      }

      const rawSlug = record.slug || record.productSlug || record.product_slug;
      const slug = rawSlug ? slugify(rawSlug) : slugify(name);

      const categorySlug = record.categorySlug || record.category_slug || record.category || record.category_name;
      if (!categorySlug) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `Product "${name}" is missing categorySlug.`,
        });
      }

      const fabric = record.fabric;
      const occasion = record.occasion;
      
      const rawBasePrice = record.basePrice || record.base_price || record.price;
      const basePrice = parseFloat(rawBasePrice);
      if (isNaN(basePrice)) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `Invalid base price for product "${name}".`,
        });
      }

      const rawCompareAtPrice = record.compareAtPrice || record.compare_at_price;
      const compareAtPrice = rawCompareAtPrice ? parseFloat(rawCompareAtPrice) : null;

      const description = record.description || record.productDescription || record.product_description;

      const sku = record.sku || record.variantSku || record.variant_sku;
      const color = record.color || record.variantColor || record.variant_color;
      const size = record.size || record.variantSize || record.variant_size || 'Free Size';
      const rawVariantPrice = record.variantPrice || record.variant_price || record.price;
      const variantPrice = rawVariantPrice ? parseFloat(rawVariantPrice) : basePrice;
      const rawStock = record.stock || record.variantStock || record.variant_stock || record.quantity || record.qty;
      const stock = rawStock ? parseInt(rawStock, 10) : 0;

      const imageUrl = record.imageUrl || record.image_url || record.image || record.primaryImage || record.primary_image;

      if (!sku || !color) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `Product "${name}" has a variant missing SKU or Color.`,
        });
      }

      if (!productsMap.has(slug)) {
        productsMap.set(slug, {
          productData: {
            name,
            slug,
            description,
            categorySlug: slugify(categorySlug),
            categoryName: categorySlug, // Backup name
            fabric,
            occasion,
            basePrice,
            compareAtPrice,
            imageUrl,
          },
          variants: [],
        });
      }

      productsMap.get(slug)!.variants.push({
        sku,
        color,
        size,
        price: isNaN(variantPrice) ? basePrice : variantPrice,
        stock: isNaN(stock) ? 0 : stock,
      });
    }

    let importedProducts = 0;
    let importedVariants = 0;

    // Process inside a transaction
    await this.prisma.$transaction(async (tx) => {
      for (const [slug, { productData, variants }] of productsMap.entries()) {
        // 1. Upsert Category
        const category = await tx.category.upsert({
          where: { slug: productData.categorySlug },
          update: {},
          create: {
            slug: productData.categorySlug,
            name: productData.categoryName,
          },
        });

        // 2. Upsert Product
        const product = await tx.product.upsert({
          where: { slug },
          update: {
            name: productData.name,
            description: productData.description,
            categoryId: category.id,
            fabric: productData.fabric,
            occasion: productData.occasion,
            basePrice: productData.basePrice,
            compareAtPrice: productData.compareAtPrice ?? null,
            status: 'active',
            deletedAt: null, // restore if soft-deleted
          },
          create: {
            slug,
            name: productData.name,
            description: productData.description,
            categoryId: category.id,
            fabric: productData.fabric,
            occasion: productData.occasion,
            basePrice: productData.basePrice,
            compareAtPrice: productData.compareAtPrice ?? null,
            status: 'active',
          },
        });

        importedProducts++;

        // 3. Upsert Variants
        for (const variant of variants) {
          await tx.productVariant.upsert({
            where: { sku: variant.sku },
            update: {
              productId: product.id,
              color: variant.color,
              size: variant.size,
              price: variant.price,
              stock: variant.stock,
            },
            create: {
              productId: product.id,
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              price: variant.price,
              stock: variant.stock,
            },
          });
          importedVariants++;
        }

        // 4. Create Product Primary Image if provided
        if (productData.imageUrl) {
          const existingImage = await tx.productImage.findFirst({
            where: { productId: product.id, isPrimary: true },
          });
          if (!existingImage) {
            await tx.productImage.create({
              data: {
                productId: product.id,
                url: productData.imageUrl,
                isPrimary: true,
                sortOrder: 0,
              },
            });
          } else if (existingImage.url !== productData.imageUrl) {
            await tx.productImage.update({
              where: { id: existingImage.id },
              data: { url: productData.imageUrl },
            });
          }
        }
      }
    });

    return { importedProducts, importedVariants };
  }
}
