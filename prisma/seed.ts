import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash della password per il login sicuro
  const hashedPassword = await bcrypt.hash('GTService2025!', 12);

  // 1. Crea/Aggiorna l'utente Admin
  const admin = await prisma.user.upsert({
    where: { email: 'giovanni@gtservice.it' },
    update: {
      password: hashedPassword // Aggiorna la password con l'hash corretto
    }, 
    create: {
      email: 'giovanni@gtservice.it',
      name: 'Giovanni',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Utente Admin configurato:', admin.email);

  // 2. Crea un cliente di prova
  try {
    await prisma.customer.create({
      data: {
        firstName: 'Mario',
        lastName: 'Rossi',
        phone: '+393331234567',
        email: 'mario.rossi@example.com',
        vehicles: {
          create: {
            plate: 'AB123CD',
            brand: 'Fiat',
            model: 'Panda',
            year: 2020,
          }
        }
      }
    });
    console.log('✅ Cliente di test creato');
  } catch {
    // FIX: Rimosso (e) per eliminare il warning "unused variable"
    console.log('ℹ️  Cliente di test già presente.');
  }
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