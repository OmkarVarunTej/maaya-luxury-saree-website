import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Milestone 1 seed: just enough to prove migrations + connection work.
 * Real category/product seed data (mirroring config.js from the frontend
 * prototype) gets added in Milestone 3 (Catalog).
 */
async function main() {
  const category = await prisma.category.upsert({
    where: { slug: 'silk' },
    update: {},
    create: { slug: 'silk', name: 'Silk Sarees', sortOrder: 1 },
  });

  console.log(`Seeded category: ${category.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
