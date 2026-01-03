import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Assicurati di importarlo

const prisma = new PrismaClient();

async function main() {
  // Hash della password predefinita
  const hashedPassword = await bcrypt.hash('GTService2025!', 12);

  // 1. Crea o Aggiorna l'utente Admin con la password criptata
  const admin = await prisma.user.upsert({
    where: { email: 'giovanni@gtservice.it' },
    update: {
      password: hashedPassword, // Aggiorna password se esiste già
      role: 'SUPER_ADMIN',
      isActive: true,
      isLocked: false,
      loginAttempts: 0
    }, 
    create: {
      email: 'giovanni@gtservice.it',
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