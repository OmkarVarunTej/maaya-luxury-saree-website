import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { slugify, withUniqueSuffix } from '../../common/utils/slug.util';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async create(dto: CreateCategoryDto) {
    const baseSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const slug = (await this.slugTaken(baseSlug)) ? withUniqueSuffix(baseSlug) : baseSlug;

    if (dto.parentId) {
      await this.assertCategoryExists(dto.parentId);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.assertCategoryExists(id);

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: 'A category cannot be its own parent.',
        });
      }
      await this.assertCategoryExists(dto.parentId);
    }

    const data: Prisma.CategoryUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.slug !== undefined ? { slug: slugify(dto.slug) } : {}),
      ...(dto.parentId !== undefined ? { parent: { connect: { id: dto.parentId } } } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    };

    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.assertCategoryExists(id);

    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Cannot delete a category with ${productCount} product(s) still assigned to it. Reassign or delete them first.`,
      });
    }

    const childCount = await this.prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'Cannot delete a category that still has subcategories.',
      });
    }

    await this.prisma.category.delete({ where: { id } });
  }

  private async slugTaken(slug: string): Promise<boolean> {
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    return existing !== null;
  }

  private async assertCategoryExists(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Category not found.' });
    }
  }
}
