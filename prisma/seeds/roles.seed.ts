import prisma from '../../lib/prisma';

async function main() {
  console.log('🌱 Seeding roles...');

  // Roles are already defined in the Prisma schema as enum
  // We'll create role permissions/abilities in a separate table if needed

  console.log('✅ Roles are defined in Prisma schema as enum:');
  console.log('   - CUSTOMER');
  console.log('   - ADMIN');
  console.log('   - SHOP_MANAGER');
  console.log('   - RIDER');
  console.log('   - DECOR_MANAGER');
  console.log('   - DECOR_STAFF');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
