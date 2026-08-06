import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Products (e2e)', () => {
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
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
  });

  describe('Public Products API', () => {
    it('GET /api/v1/products -> should return paginated list of active products', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk', slug: 'silk' },
      });

      await prisma.product.create({
        data: {
          name: 'Royal Saree',
          slug: 'royal-saree',
          categoryId: cat.id,
          basePrice: 15000,
          status: 'active',
          fabric: 'Silk',
          occasion: 'wedding',
        },
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/products?category=silk&fabric=silk')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].slug).toBe('royal-saree');
      expect(res.body.meta.total).toBe(1);
    });

    it('GET /api/v1/products/:slug -> should return detailed product view', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk', slug: 'silk' },
      });

      await prisma.product.create({
        data: {
          name: 'Royal Saree',
          slug: 'royal-saree',
          categoryId: cat.id,
          basePrice: 15000,
          status: 'active',
          variants: {
            create: { sku: 'RS-RED', color: 'Red', price: 15000, stock: 10 },
          },
        },
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/products/royal-saree')
        .expect(200);

      expect(res.body.slug).toBe('royal-saree');
      expect(res.body.variants.length).toBe(1);
      expect(res.body.variants[0].sku).toBe('RS-RED');
    });

    it('GET /api/v1/products/:slug/related -> should return related same-category products', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk', slug: 'silk' },
      });

      await prisma.product.create({
        data: { name: 'Royal Saree', slug: 'royal-saree', categoryId: cat.id, basePrice: 15000, status: 'active' },
      });

      await prisma.product.create({
        data: { name: 'Zari Saree', slug: 'zari-saree', categoryId: cat.id, basePrice: 18000, status: 'active' },
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/products/royal-saree/related')
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].slug).toBe('zari-saree');
    });
  });

  describe('Admin Products API & Bulk Import', () => {
    it('POST /api/v1/admin/products -> should create a new product and nested variants', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Silk', slug: 'silk' },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Handwoven Banarasi Saree',
          categoryId: cat.id,
          basePrice: 20000,
          status: 'draft',
          variants: [
            { sku: 'HB-GLD', color: 'Gold', price: 20000, stock: 5 },
          ],
        })
        .expect(201);

      expect(res.body.slug).toBe('handwoven-banarasi-saree');
      expect(res.body.variants.length).toBe(1);
      expect(res.body.variants[0].sku).toBe('HB-GLD');
    });

    it('POST /api/v1/admin/products/bulk-import -> should parse and upsert products from CSV', async () => {
      const csvContent = 
        'name,categorySlug,basePrice,sku,color,size,price,stock,imageUrl\n' +
        'Heritage Cotton,cotton,3200,HC-BLU,Blue,Free Size,3200,10,images/hc-blue.jpg\n' +
        'Heritage Cotton,cotton,3200,HC-RED,Red,Free Size,3200,5,images/hc-blue.jpg';

      const buffer = Buffer.from(csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/products/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', buffer, 'products.csv')
        .expect(201);

      expect(res.body.importedProducts).toBe(1);
      expect(res.body.importedVariants).toBe(2);

      const dbProduct = await prisma.product.findUnique({
        where: { slug: 'heritage-cotton' },
        include: { variants: true, images: true },
      });

      expect(dbProduct).not.toBeNull();
      expect(dbProduct!.variants.length).toBe(2);
      expect(dbProduct!.images.length).toBe(1);
      expect(dbProduct!.images[0].url).toBe('images/hc-blue.jpg');
    });
  });
});
