import prisma from '../../lib/prisma';
import { hashOtp } from '../../lib/otp';

async function main() {
  console.log('🌱 Seeding admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@giftgallery.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Create admin user
  const passwordHash = await hashOtp(adminPassword);

  const admin = await prisma.user.create({
    data: {
      full_name: 'System Administrator',
      email: adminEmail,
      password_hash: passwordHash,
      role: 'ADMIN',
      auth_provider: 'credentials',
      status: 'active',
      email_verified_at: new Date(),
    },
  });

  console.log('✅ Admin user created:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   ⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
