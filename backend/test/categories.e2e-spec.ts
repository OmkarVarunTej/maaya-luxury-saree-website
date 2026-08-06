import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    // Generate token
    const secret = process.env.JWT_ADMIN_ACCESS_SECRET || 'test-admin-secret';
    adminToken = jwt.sign(
      { sub: 'test-admin', email: 'admin@example.com' },
      secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear data in correct dependency order
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
  });

  describe('Public Categories API', () => {
    it('GET /api/v1/categories -> should return categories with live counts', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk Sarees', slug: 'silk', sortOrder: 1 },
      });

      await prisma.product.create({
        data: {
          name: 'Classic Silk',
          slug: 'classic-silk',
          categoryId: cat.id,
          basePrice: 5000,
          status: 'active',
        },
      });

      await prisma.product.create({
        data: {
          name: 'Draft Silk',
          slug: 'draft-silk',
          categoryId: cat.id,
          basePrice: 4000,
          status: 'draft',
        },
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].slug).toBe('silk');
      expect(res.body[0].productCount).toBe(1);
    });
  });

  describe('Admin Categories API', () => {
    it('POST /api/v1/admin/categories -> should create category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Chiffon Sarees', slug: 'chiffon' })
        .expect(201);

      expect(res.body.slug).toBe('chiffon');
      expect(res.body.name).toBe('Chiffon Sarees');

      const dbCategory = await prisma.category.findUnique({ where: { slug: 'chiffon' } });
      expect(dbCategory).not.toBeNull();
    });

    it('POST /api/v1/admin/categories -> should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .send({ name: 'Chiffon' })
        .expect(401);
    });

    it('PATCH /api/v1/admin/categories/:id -> should update category', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk', slug: 'silk' },
      });

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/categories/${cat.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Pure Silk' })
        .expect(200);

      expect(res.body.name).toBe('Pure Silk');
    });

    it('DELETE /api/v1/admin/categories/:id -> should delete category', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk', slug: 'silk' },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/categories/${cat.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const dbCategory = await prisma.category.findUnique({ where: { id: cat.id } });
      expect(dbCategory).toBeNull();
    });

    it('DELETE /api/v1/admin/categories/:id -> should block deletion if category contains products', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk', slug: 'silk' },
      });

      await prisma.product.create({
        data: {
          name: 'Classic Silk',
          slug: 'classic-silk',
          categoryId: cat.id,
          basePrice: 5000,
          status: 'active',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/categories/${cat.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);
    });
  });
});
