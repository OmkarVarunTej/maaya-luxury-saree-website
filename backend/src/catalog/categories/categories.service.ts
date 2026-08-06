import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithProductCounts() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'active',
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return categories.map((cat) => {
      const { _count, ...rest } = cat;
      return {
        ...rest,
        productCount: _count?.products ?? 0,
      };
    });
  }
}
