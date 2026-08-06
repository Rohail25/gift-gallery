import prisma from '../../lib/prisma';

type CategorySeed = {
  name: string;
  slug: string;
  event_type_id: number | undefined;
  sort_order: number;
  status: 'active';
  is_visible: boolean;
};

async function main() {
  console.log('🌱 Seeding decor categories...');

  // Get event types first
  const wedding = await prisma.eventType.findUnique({ where: { slug: 'wedding' } });
  const mehndi = await prisma.eventType.findUnique({ where: { slug: 'mehndi' } });
  const nikkah = await prisma.eventType.findUnique({ where: { slug: 'nikkah' } });
  const walima = await prisma.eventType.findUnique({ where: { slug: 'walima' } });
  const birthday = await prisma.eventType.findUnique({ where: { slug: 'birthday' } });
  const babyShower = await prisma.eventType.findUnique({ where: { slug: 'baby-shower' } });
  const engagement = await prisma.eventType.findUnique({ where: { slug: 'engagement' } });
  const corporate = await prisma.eventType.findUnique({ where: { slug: 'corporate-event' } });
  const anniversary = await prisma.eventType.findUnique({ where: { slug: 'anniversary' } });

  const categories: CategorySeed[] = [
    // Wedding
    { name: 'Stage Decoration', slug: 'wedding-stage', event_type_id: wedding?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Venue Decoration', slug: 'wedding-venue', event_type_id: wedding?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Floral Arrangements', slug: 'wedding-flowers', event_type_id: wedding?.id, sort_order: 3, status: 'active', is_visible: true },

    // Mehndi
    { name: 'Stage Decoration', slug: 'mehndi-stage', event_type_id: mehndi?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Seating Arrangements', slug: 'mehndi-seating', event_type_id: mehndi?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Color Theme Setup', slug: 'mehndi-theme', event_type_id: mehndi?.id, sort_order: 3, status: 'active', is_visible: true },

    // Nikkah
    { name: 'Stage Decoration', slug: 'nikkah-stage', event_type_id: nikkah?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Quran Stand Setup', slug: 'nikkah-quran-stand', event_type_id: nikkah?.id, sort_order: 2, status: 'active', is_visible: true },

    // Walima
    { name: 'Stage Decoration', slug: 'walima-stage', event_type_id: walima?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Table Decorations', slug: 'walima-tables', event_type_id: walima?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Lighting Effects', slug: 'walima-lighting', event_type_id: walima?.id, sort_order: 3, status: 'active', is_visible: true },

    // Birthday
    { name: 'Balloon Decoration', slug: 'birthday-balloons', event_type_id: birthday?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Theme Decoration', slug: 'birthday-theme', event_type_id: birthday?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Photo Backdrop', slug: 'birthday-backdrop', event_type_id: birthday?.id, sort_order: 3, status: 'active', is_visible: true },

    // Baby Shower
    { name: 'Pastel Decorations', slug: 'baby-shower-pastel', event_type_id: babyShower?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Theme Setup', slug: 'baby-shower-theme', event_type_id: babyShower?.id, sort_order: 2, status: 'active', is_visible: true },

    // Engagement
    { name: 'Stage Decoration', slug: 'engagement-stage', event_type_id: engagement?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Ring Ceremony Setup', slug: 'engagement-ring-setup', event_type_id: engagement?.id, sort_order: 2, status: 'active', is_visible: true },

    // Corporate
    { name: 'Stage and Podium', slug: 'corporate-stage', event_type_id: corporate?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Branded Decor', slug: 'corporate-branding', event_type_id: corporate?.id, sort_order: 2, status: 'active', is_visible: true },
    { name: 'Conference Setup', slug: 'corporate-conference', event_type_id: corporate?.id, sort_order: 3, status: 'active', is_visible: true },

    // Anniversary
    { name: 'Romantic Setup', slug: 'anniversary-romantic', event_type_id: anniversary?.id, sort_order: 1, status: 'active', is_visible: true },
    { name: 'Photo Display', slug: 'anniversary-photos', event_type_id: anniversary?.id, sort_order: 2, status: 'active', is_visible: true },
  ];

  for (const category of categories) {
    if (!category.event_type_id) continue;

    const existing = await prisma.decorCategory.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      await prisma.decorCategory.create({ data: { ...category, event_type_id: category.event_type_id! } });
      console.log(`✅ Created: ${category.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${category.name}`);
    }
  }

  console.log('✅ Decor categories seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding decor categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
