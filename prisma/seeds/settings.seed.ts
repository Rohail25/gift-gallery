import prisma from '../../lib/prisma';

async function main() {
  console.log('🌱 Seeding site settings...');

  const defaults: Array<{
    key: string;
    value: string;
    label: string;
    group: string;
    is_public: boolean;
  }> = [
    { key: 'store_name', value: 'Gift Gallery', label: 'Store Name', group: 'general', is_public: true },
    { key: 'store_tagline', value: 'Beautiful gifts for every occasion', label: 'Tagline', group: 'general', is_public: true },
    { key: 'store_email', value: 'support@giftgallery.com', label: 'Support Email', group: 'contact', is_public: true },
    { key: 'store_phone', value: '+92 300 0000000', label: 'Support Phone', group: 'contact', is_public: true },
    { key: 'store_address', value: 'Shop 12, Main Boulevard, Gulberg III, Lahore, Pakistan', label: 'Store Address', group: 'contact', is_public: true },
    { key: 'whatsapp_number', value: '+92 300 0000000', label: 'WhatsApp Number', group: 'contact', is_public: true },
    { key: 'facebook_url', value: 'https://facebook.com/giftgallery', label: 'Facebook URL', group: 'social', is_public: true },
    { key: 'instagram_url', value: 'https://instagram.com/giftgallery', label: 'Instagram URL', group: 'social', is_public: true },
    { key: 'tiktok_url', value: 'https://tiktok.com/@giftgallery', label: 'TikTok URL', group: 'social', is_public: true },
  ];

  for (const setting of defaults) {
    const existing = await prisma.siteSetting.findUnique({
      where: { key: setting.key },
    });

    if (!existing) {
      await prisma.siteSetting.create({ data: setting });
      console.log(`✅ Created: ${setting.key}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${setting.key}`);
    }
  }

  console.log('✅ Site settings seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding site settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
