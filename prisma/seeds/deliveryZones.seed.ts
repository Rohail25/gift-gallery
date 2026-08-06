import prisma from '../../lib/prisma';

async function main() {
  console.log('🌱 Seeding delivery zones...');

  const zones = [
    // Karachi
    { name: 'Karachi Central', city: 'Karachi', area: 'DHA', delivery_charge: 250, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Karachi North', city: 'Karachi', area: 'Clifton', delivery_charge: 300, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Karachi East', city: 'Karachi', area: 'Gulberg', delivery_charge: 250, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Karachi West', city: 'Karachi', area: 'Lyari', delivery_charge: 350, minimum_order_amount: 3000, free_delivery_minimum: 6000, estimated_min_minutes: 45, estimated_max_minutes: 90, cash_on_delivery_available: true, is_active: true },
    { name: 'Karachi South', city: 'Karachi', area: 'Saddar', delivery_charge: 200, minimum_order_amount: 2000, free_delivery_minimum: 4000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },

    // Lahore
    { name: 'Lahore Central', city: 'Lahore', area: 'The Zone', delivery_charge: 300, minimum_order_amount: 3000, free_delivery_minimum: 6000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Lahore North', city: 'Lahore', area: ' Gulberg', delivery_charge: 250, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Lahore East', city: 'Lahore', area: 'Model Town', delivery_charge: 250, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Lahore West', city: 'Lahore', area: 'Wapda Town', delivery_charge: 200, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },

    // Islamabad
    { name: 'Islamabad Central', city: 'Islamabad', area: 'F-6', delivery_charge: 300, minimum_order_amount: 3000, free_delivery_minimum: 6000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Islamabad East', city: 'Islamabad', area: 'G-10', delivery_charge: 350, minimum_order_amount: 3000, free_delivery_minimum: 6000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },
    { name: 'Islamabad West', city: 'Islamabad', area: 'I-8', delivery_charge: 300, minimum_order_amount: 3000, free_delivery_minimum: 6000, estimated_min_minutes: 30, estimated_max_minutes: 60, cash_on_delivery_available: true, is_active: true },

    // Faisalabad
    { name: 'Faisalabad City', city: 'Faisalabad', area: 'Faisalabad', delivery_charge: 200, minimum_order_amount: 2000, free_delivery_minimum: 4000, estimated_min_minutes: 45, estimated_max_minutes: 90, cash_on_delivery_available: true, is_active: true },

    // Rawalpindi
    { name: 'Rawalpindi City', city: 'Rawalpindi', area: 'Rawalpindi', delivery_charge: 200, minimum_order_amount: 2000, free_delivery_minimum: 4000, estimated_min_minutes: 45, estimated_max_minutes: 90, cash_on_delivery_available: true, is_active: true },

    // Multan
    { name: 'Multan City', city: 'Multan', area: 'Multan', delivery_charge: 200, minimum_order_amount: 2000, free_delivery_minimum: 4000, estimated_min_minutes: 60, estimated_max_minutes: 120, cash_on_delivery_available: true, is_active: true },

    // Peshawar
    { name: 'Peshawar City', city: 'Peshawar', area: 'Peshawar', delivery_charge: 250, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 60, estimated_max_minutes: 120, cash_on_delivery_available: true, is_active: true },

    // Quetta
    { name: 'Quetta City', city: 'Quetta', area: 'Quetta', delivery_charge: 250, minimum_order_amount: 2500, free_delivery_minimum: 5000, estimated_min_minutes: 60, estimated_max_minutes: 120, cash_on_delivery_available: true, is_active: true },

    // Sialkot
    { name: 'Sialkot City', city: 'Sialkot', area: 'Sialkot', delivery_charge: 150, minimum_order_amount: 2000, free_delivery_minimum: 4000, estimated_min_minutes: 45, estimated_max_minutes: 90, cash_on_delivery_available: true, is_active: true },
  ];

  for (const zone of zones) {
    const existing = await prisma.deliveryZone.findFirst({
      where: { city: zone.city, area: zone.area },
    });

    if (!existing) {
      await prisma.deliveryZone.create({ data: zone });
      console.log(`✅ Created: ${zone.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${zone.name}`);
    }
  }

  console.log('✅ Delivery zones seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding delivery zones:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
