const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  const userHashedPassword = await bcrypt.hash('User@123456', 10);

  // Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tts-app.com' },
    update: {},
    create: {
      email: 'admin@tts-app.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      usage: {
        create: {
          charactersUsed: 0,
          generationCount: 0,
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Upsert Demo Regular User
  const user = await prisma.user.upsert({
    where: { email: 'demo@tts-app.com' },
    update: {},
    create: {
      email: 'demo@tts-app.com',
      name: 'Demo User',
      password: userHashedPassword,
      role: 'USER',
      usage: {
        create: {
          charactersUsed: 0,
          generationCount: 0,
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log('✅ Seed completed successfully:');
  console.log(`- Admin: ${admin.email} (Password: Admin@123456)`);
  console.log(`- User:  ${user.email} (Password: User@123456)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
