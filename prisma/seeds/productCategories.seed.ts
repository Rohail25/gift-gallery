import prisma from '../../lib/prisma';

type CategorySeed = {
  name: string;
  slug: string;
  gift_type_id: number | undefined;
  sort_order: number;
  status: 'active';
  is_visible: boolean;
};

async function main() {
  console.log('🌱 Seeding product categories...');

  // Get gift types first
  const weddingGift = await prisma.giftType.findUnique({ where: { slug: 'wedding-gifts' } });
  const birthdayGift = await prisma.giftType.findUnique({ where: { slug: 'birthday-gifts' } });
  const umrahGift = await prisma.giftType.findUnique({ where: { slug: 'umrah-gifts' } });
  const anniversaryGift = await prisma.giftType.findUnique({ where: { slug: 'anniversary-gifts' } });
  const corporateGift = await prisma.giftType.findUnique({ where: { slug: 'corporate-gifts' } });
  const eidGift = await prisma.giftType.findUnique({ where: { slug: 'eid-gifts' } });

  const categories: CategorySeed[] = [
    // Wedding
    { name: 'Watches', slug: 'watches', gift_type_id: weddingGift?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Perfumes', slug: 'perfumes', gift_type_id: weddingGift?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Gift Baskets', slug: 'gift-baskets', gift_type_id: weddingGift?.id, sort_order: 3, status: 'active', is_visible: true },
    { name: 'Jewelry Sets', slug: 'jewelry-sets', gift_type_id: weddingGift?.id, sort_order: 4, status: 'active', is_visible: true },

    // Birthday
    { name: 'Chocolates', slug: 'chocolates', gift_type_id: birthdayGift?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Birthday Watches', slug: 'birthday-watches', gift_type_id: birthdayGift?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Birthday Perfumes', slug: 'birthday-perfumes', gift_type_id: birthdayGift?.id, sort_order: 3, status: 'active', is_visible: true },

    // Umrah
    { name: 'Prayer Mats', slug: 'prayer-mats', gift_type_id: umrahGift?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Tasbeeh', slug: 'tasbeeh', gift_type_id: umrahGift?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Islamic Gift Boxes', slug: 'islamic-gift-boxes', gift_type_id: umrahGift?.id, sort_order: 3, status: 'active', is_visible: true },
    { name: 'Quran Holders', slug: 'quran-holders', gift_type_id: umrahGift?.id, sort_order: 4, status: 'active', is_visible: true },

    // Anniversary
    { name: 'Luxury Flowers', slug: 'luxury-flowers', gift_type_id: anniversaryGift?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Anniversary Jewelry', slug: 'anniversary-jewelry', gift_type_id: anniversaryGift?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Photo Frames', slug: 'photo-frames', gift_type_id: anniversaryGift?.id, sort_order: 3, status: 'active', is_visible: true },

    // Corporate
    { name: 'Executive Gifts', slug: 'executive-gifts', gift_type_id: corporateGift?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Custom Hampers', slug: 'custom-hampers', gift_type_id: corporateGift?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Trophy & Awards', slug: 'trophy-awards', gift_type_id: corporateGift?.id, sort_order: 3, status: 'active', is_visible: true },

    // Eid
    { name: 'Eid Gift Boxes', slug: 'eid-gift-boxes', gift_type_id: eidGift?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Eid Sweets', slug: 'eid-sweets', gift_type_id: eidGift?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Eid Decorations', slug: 'eid-decorations', gift_type_id: eidGift?.id, sort_order: 3, status: 'active', is_visible: true },
  ];

  for (const category of categories) {
    if (!category.gift_type_id) continue;

    const existing = await prisma.productCategory.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      await prisma.productCategory.create({
        data: {
          name: category.name,
          slug: category.slug,
          sort_order: category.sort_order,
          status: category.status,
          is_visible: category.is_visible,
          giftTypes: {
            create: [{ gift_type_id: category.gift_type_id! }],
          },
        },
      });
      console.log(`✅ Created: ${category.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${category.name}`);
    }
  }

  console.log('✅ Product categories seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding product categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
