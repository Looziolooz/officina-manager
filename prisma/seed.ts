import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validateEnv } from '@/lib/env';

const prisma = new PrismaClient();

async function main() {
  // Validate environment variables
  validateEnv();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'giovanni@gtservice.it';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD environment variable is required for seed');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      isLocked: false,
      loginAttempts: 0
    },
    create: {
      email: adminEmail,
      name: 'Giovanni',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Utente Admin configurato con password criptata:', admin.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });