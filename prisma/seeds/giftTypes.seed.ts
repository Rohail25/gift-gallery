import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

async function main() {
  console.log('🌱 Seeding gift types...');

  const giftTypes: Prisma.GiftTypeCreateInput[] = [
    {
      name: 'Wedding Gifts',
      slug: 'wedding-gifts',
      description: 'Exquisite gifts for the newlyweds to celebrate their special day',
      sort_order: 1,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Birthday Gifts',
      slug: 'birthday-gifts',
      description: 'Make birthdays memorable with our curated gift collections',
      sort_order: 2,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Umrah Gifts',
      slug: 'umrah-gifts',
      description: 'Sacred gifts for pilgrims returning from the holy journey',
      sort_order: 3,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Anniversary Gifts',
      slug: 'anniversary-gifts',
      description: 'Celebrate years of love and togetherness with premium gifts',
      sort_order: 4,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Corporate Gifts',
      slug: 'corporate-gifts',
      description: 'Professional gifts for business partners and employees',
      sort_order: 5,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Baby Shower',
      slug: 'baby-shower',
      description: 'Adorable gifts for the little ones and new parents',
      sort_order: 6,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Graduation Gifts',
      slug: 'graduation-gifts',
      description: 'Congratulate achievements with thoughtful presents',
      sort_order: 7,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Eid Gifts',
      slug: 'eid-gifts',
      description: 'Share the joy of Eid with family and friends',
      sort_order: 8,
      status: 'active',
      is_visible: true,
    },
  ];

  for (const giftType of giftTypes) {
    const existing = await prisma.giftType.findUnique({
      where: { slug: giftType.slug },
    });

    if (!existing) {
      await prisma.giftType.create({ data: giftType });
      console.log(`✅ Created: ${giftType.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${giftType.name}`);
    }
  }

  console.log('✅ Gift types seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding gift types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
