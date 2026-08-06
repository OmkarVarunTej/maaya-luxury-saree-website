import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Milestone 3 seed: real categories + a handful of representative products
 * with variants and images, mirroring the mock data in the frontend's
 * `js/config.js` (CATEGORIES / OCCASIONS / FABRICS / PRODUCTS) so the
 * frontend can be pointed at these APIs with matching slugs/names while the
 * rest of the catalog is imported via the admin bulk-import endpoint.
 */

const CATEGORIES = [
  { slug: 'wedding', name: 'Wedding Sarees', imageUrl: 'images/cat_wedding.png', sortOrder: 1 },
  { slug: 'silk', name: 'Silk Sarees', imageUrl: 'images/cat_silk.png', sortOrder: 2 },
  { slug: 'banarasi', name: 'Banarasi', imageUrl: 'images/cat_banarasi.png', sortOrder: 3 },
  { slug: 'cotton', name: 'Cotton Sarees', imageUrl: 'images/cat_cotton.png', sortOrder: 4 },
  { slug: 'party', name: 'Party Wear', imageUrl: 'images/cat_party.png', sortOrder: 5 },
  { slug: 'designer', name: 'Designer Collection', imageUrl: 'images/cat_designer.png', sortOrder: 6 },
];

const COLORS = ['Maroon', 'Gold', 'Ivory', 'Emerald', 'Blush', 'Peacock', 'Rust', 'Wine'];

const SEED_PRODUCTS = [
  {
    name: 'Royal Kanchipuram Silk Saree',
    category: 'silk',
    fabric: 'Silk',
    occasion: 'wedding',
    basePrice: 24500,
    compareAtPrice: 29999,
    image: 'images/saree_model_5.png',
  },
  {
    name: 'Banarasi Zari Elegance',
    category: 'banarasi',
    fabric: 'Silk',
    occasion: 'wedding',
    basePrice: 31500,
    compareAtPrice: null,
    image: 'images/teal_saree.png',
  },
  {
    name: 'Heritage Cotton Handloom Saree',
    category: 'cotton',
    fabric: 'Cotton',
    occasion: 'casual',
    basePrice: 3200,
    compareAtPrice: 3999,
    image: 'images/saree_5.jpg',
  },
  {
    name: 'Emerald Organza Party Saree',
    category: 'party',
    fabric: 'Organza',
    occasion: 'party',
    basePrice: 8900,
    compareAtPrice: 10999,
    image: 'images/saree_7.jpg',
  },
  {
    name: 'Rose Gold Designer Saree',
    category: 'designer',
    fabric: 'Georgette',
    occasion: 'office',
    basePrice: 14200,
    compareAtPrice: null,
    image: 'images/saree_15.jpg',
  },
];

async function main() {
  const categoryIdBySlug = new Map<string, string>();

  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, imageUrl: category.imageUrl, sortOrder: category.sortOrder },
      create: category,
    });
    categoryIdBySlug.set(category.slug, row.id);
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);

  let productCount = 0;
  for (const [i, p] of SEED_PRODUCTS.entries()) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        categoryId,
        fabric: p.fabric,
        occasion: p.occasion,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice ?? undefined,
        status: 'active',
      },
      create: {
        slug,
        name: p.name,
        description: `Handwoven by master artisans, the ${p.name} brings together time-honoured weaving traditions with a refined, contemporary silhouette.`,
        categoryId,
        fabric: p.fabric,
        occasion: p.occasion,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice ?? undefined,
        status: 'active',
      },
    });

    const color1 = COLORS[i % COLORS.length];
    const color2 = COLORS[(i + 3) % COLORS.length];

    for (const color of [color1, color2]) {
      const sku = `${slug}-${color.toLowerCase()}`.slice(0, 60);
      await prisma.productVariant.upsert({
        where: { sku },
        update: { price: p.basePrice, stock: 12 },
        create: {
          productId: product.id,
          sku,
          color,
          size: 'Free Size',
          price: p.basePrice,
          stock: 12,
        },
      });
    }

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id, isPrimary: true },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: product.id, url: p.image, isPrimary: true, sortOrder: 0 },
      });
    }

    productCount += 1;
  }
  console.log(`Seeded ${productCount} products (with variants + a primary image each).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
