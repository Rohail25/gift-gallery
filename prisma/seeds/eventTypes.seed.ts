import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

async function main() {
  console.log('🌱 Seeding event types...');

  const eventTypes: Prisma.EventTypeCreateInput[] = [
    {
      name: 'Wedding',
      slug: 'wedding',
      short_description: 'Elegant wedding decoration services for your special day',
      description: 'Transform your wedding venue into a magical celebration space with our premium decoration services. From traditional to modern themes, we create unforgettable wedding experiences.',
      sort_order: 1,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Mehndi',
      slug: 'mehndi',
      short_description: 'Beautiful mehndi ceremony decorations',
      description: 'Celebrate the beauty of mehndi night with stunning decorations designed to match the elegance of the occasion.',
      sort_order: 2,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Nikkah',
      slug: 'nikkah',
      short_description: 'Intimate nikkah ceremony setups',
      description: 'Create a sacred and beautiful space for your nikkah ceremony with our specialized decoration packages.',
      sort_order: 3,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Walima',
      slug: 'walima',
      short_description: 'Grand walima reception decorations',
      description: 'Make your walima celebration memorable with exquisite decor that reflects the joy of the occasion.',
      sort_order: 4,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Birthday',
      slug: 'birthday',
      short_description: 'Fun and festive birthday party decorations',
      description: 'From kids parties to adult celebrations, we provide theme-based birthday decorations that make every party special.',
      sort_order: 5,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Baby Shower',
      slug: 'baby-shower',
      short_description: 'Adorable baby shower decorations',
      description: 'Celebrate the upcoming arrival with sweet and thoughtful baby shower decorations in soft, pastel tones.',
      sort_order: 6,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Engagement',
      slug: 'engagement',
      short_description: 'Romantic engagement ceremony setups',
      description: 'Mark the beginning of a new journey with elegant engagement ceremony decorations.',
      sort_order: 7,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Corporate Event',
      slug: 'corporate-event',
      short_description: 'Professional corporate event decorations',
      description: 'Elevate your corporate gatherings with sophisticated and professional decor that reflects your brand.',
      sort_order: 8,
      status: 'active',
      is_visible: true,
    },
    {
      name: 'Anniversary',
      slug: 'anniversary',
      short_description: 'Romantic anniversary celebration decorations',
      description: 'Celebrate years of love with beautiful anniversary decorations that create magical memories.',
      sort_order: 9,
      status: 'active',
      is_visible: true,
    },
  ];

  for (const eventType of eventTypes) {
    const existing = await prisma.eventType.findUnique({
      where: { slug: eventType.slug },
    });

    if (!existing) {
      await prisma.eventType.create({ data: eventType });
      console.log(`✅ Created: ${eventType.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${eventType.name}`);
    }
  }

  console.log('✅ Event types seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding event types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
