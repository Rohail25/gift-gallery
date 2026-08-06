import prisma from '../../lib/prisma';

async function main() {
  console.log('🌱 Seeding cities...');

  const cities = [
    { id: 1, name: 'Karachi', province: 'Sindh' },
    { id: 2, name: 'Lahore', province: 'Punjab' },
    { id: 3, name: 'Faisalabad', province: 'Punjab' },
    { id: 4, name: 'Rawalpindi', province: 'Punjab' },
    { id: 5, name: 'Islamabad', province: 'Federal' },
    { id: 6, name: 'Multan', province: 'Punjab' },
    { id: 7, name: 'Gujranwala', province: 'Punjab' },
    { id: 8, name: 'Peshawar', province: 'Khyber Pakhtunkhwa' },
    { id: 9, name: 'Quetta', province: 'Balochistan' },
    { id: 10, name: 'Sialkot', province: 'Punjab' },
    { id: 11, name: 'Hyderabad', province: 'Sindh' },
    { id: 12, name: 'Bahawalpur', province: 'Punjab' },
    { id: 13, name: 'Sargodha', province: 'Punjab' },
    { id: 14, name: 'Sukkur', province: 'Sindh' },
    { id: 15, name: 'Sheikhupura', province: 'Punjab' },
    { id: 16, name: 'Abbottabad', province: 'Khyber Pakhtunkhwa' },
    { id: 17, name: 'Jhang', province: 'Punjab' },
    { id: 18, name: 'Mardan', province: 'Khyber Pakhtunkhwa' },
    { id: 19, name: 'Gujrat', province: 'Punjab' },
    { id: 20, name: 'Sahiwal', province: 'Punjab' },
    { id: 21, name: 'Dera Ghazi Khan', province: 'Punjab' },
    { id: 22, name: 'Kasur', province: 'Punjab' },
    { id: 23, name: 'Okara', province: 'Punjab' },
    { id: 24, name: 'Mingora', province: 'Khyber Pakhtunkhwa' },
    { id: 25, name: 'Nawabshah', province: 'Sindh' },
    { id: 26, name: 'Mirpur Khas', province: 'Sindh' },
    { id: 27, name: 'Chiniot', province: 'Punjab' },
    { id: 28, name: 'Kamoke', province: 'Punjab' },
    { id: 29, name: 'Mandi Bahauddin', province: 'Punjab' },
    { id: 30, name: 'Murree', province: 'Punjab' },
    { id: 31, name: 'Haripur', province: 'Khyber Pakhtunkhwa' },
    { id: 32, name: 'Gojra', province: 'Punjab' },
    { id: 33, name: 'Muzaffargarh', province: 'Punjab' },
    { id: 34, name: 'Kohat', province: 'Khyber Pakhtunkhwa' },
    { id: 35, name: 'Muzaffarabad', province: 'Azad Kashmir' },
    { id: 36, name: 'Rahim Yar Khan', province: 'Punjab' },
    { id: 37, name: 'Khanewal', province: 'Punjab' },
    { id: 38, name: 'Jacobabad', province: 'Sindh' },
    { id: 39, name: 'Jhelum', province: 'Punjab' },
    { id: 40, name: 'Shikarpur', province: 'Sindh' },
    { id: 41, name: 'Kharian', province: 'Punjab' },
    { id: 42, name: 'Daska', province: 'Punjab' },
    { id: 43, name: 'Hafizabad', province: 'Punjab' },
    { id: 44, name: 'Kotli', province: 'Azad Kashmir' },
    { id: 45, name: 'Chakwal', province: 'Punjab' },
    { id: 46, name: 'Layyah', province: 'Punjab' },
    { id: 47, name: 'Nowshera', province: 'Khyber Pakhtunkhwa' },
    { id: 48, name: 'Bannu', province: 'Khyber Pakhtunkhwa' },
    { id: 49, name: 'Vehari', province: 'Punjab' },
    { id: 50, name: 'Turbat', province: 'Balochistan' },
    { id: 51, name: 'Lodhran', province: 'Punjab' },
    { id: 52, name: 'Pakpattan', province: 'Punjab' },
    { id: 53, name: 'Karak', province: 'Khyber Pakhtunkhwa' },
    { id: 54, name: 'Wazirabad', province: 'Punjab' },
    { id: 55, name: 'Toba Tek Singh', province: 'Punjab' },
    { id: 56, name: 'Khushab', province: 'Punjab' },
    { id: 57, name: 'Dadu', province: 'Sindh' },
    { id: 58, name: 'Bahawalnagar', province: 'Punjab' },
    { id: 59, name: 'Bhakkar', province: 'Punjab' },
    { id: 60, name: 'Rajanpur', province: 'Punjab' },
    { id: 61, name: 'Gwadar', province: 'Balochistan' },
    { id: 62, name: 'Larkana', province: 'Sindh' },
    { id: 63, name: 'Naran', province: 'Khyber Pakhtunkhwa' },
    { id: 64, name: 'Muridke', province: 'Punjab' },
    { id: 65, name: 'Chishtian', province: 'Punjab' },
    { id: 66, name: 'Sambrial', province: 'Punjab' },
    { id: 67, name: 'Mansehra', province: 'Khyber Pakhtunkhwa' },
    { id: 68, name: 'Shahdadkot', province: 'Sindh' },
    { id: 69, name: 'Umerkot', province: 'Sindh' },
    { id: 70, name: 'Tando Allahyar', province: 'Sindh' },
    { id: 71, name: 'Khairpur', province: 'Sindh' },
    { id: 72, name: 'Dera Ismail Khan', province: 'Khyber Pakhtunkhwa' },
    { id: 73, name: 'Charsadda', province: 'Khyber Pakhtunkhwa' },
    { id: 74, name: 'Swabi', province: 'Khyber Pakhtunkhwa' },
    { id: 75, name: 'Lalamusa', province: 'Punjab' },
    { id: 76, name: 'Pattoki', province: 'Punjab' },
    { id: 77, name: 'Burewala', province: 'Punjab' },
    { id: 78, name: 'Arifwala', province: 'Punjab' },
    { id: 79, name: 'Chichawatni', province: 'Punjab' },
    { id: 80, name: 'Hasilpur', province: 'Punjab' },
    { id: 81, name: 'Depalpur', province: 'Punjab' },
    { id: 82, name: 'Renala Khurd', province: 'Punjab' },
    { id: 83, name: 'Phoolnagar', province: 'Punjab' },
    { id: 84, name: 'Pirmahal', province: 'Punjab' },
    { id: 85, name: 'Kabirwala', province: 'Punjab' },
    { id: 86, name: 'Jatoi', province: 'Punjab' },
    { id: 87, name: 'Ahmadpur East', province: 'Punjab' },
    { id: 88, name: 'Liaqatabad', province: 'Punjab' },
    { id: 89, name: 'Jampur', province: 'Punjab' },
    { id: 90, name: 'Rojhan', province: 'Punjab' },
    { id: 91, name: 'Taunsa', province: 'Punjab' },
    { id: 92, name: 'Jatoi Sharif', province: 'Punjab' },
    { id: 93, name: 'Khanpur', province: 'Punjab' },
    { id: 94, name: 'Liaquatpur', province: 'Punjab' },
    { id: 95, name: 'Sadiqabad', province: 'Punjab' },
    { id: 96, name: 'Zahir Pir', province: 'Punjab' },
    { id: 97, name: 'Chak Jhumra', province: 'Punjab' },
    { id: 98, name: 'Faisalabad Cantt', province: 'Punjab' },
    { id: 99, name: 'Samundri', province: 'Punjab' },
    { id: 100, name: 'Tandlianwala', province: 'Punjab' },
  ];

  for (const city of cities) {
    const existing = await prisma.city.findUnique({
      where: { id: city.id },
    });

    if (!existing) {
      await prisma.city.create({ data: city });
      console.log(`✅ Created: ${city.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${city.name}`);
    }
  }

  console.log('✅ Cities seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding cities:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
