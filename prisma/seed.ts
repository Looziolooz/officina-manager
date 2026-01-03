import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Crea l'utente Admin
  // Nota: Qui usiamo una password placeholder. 
  // In produzione DEVI usare uno script che faccia l'hash (come fix-auth.mjs)
  const admin = await prisma.user.upsert({
    where: { email: 'giovanni@gtservice.it' },
    update: {}, 
    create: {
      email: 'giovanni@gtservice.it',
      name: 'Giovanni',
      password: 'GTService2025!', 
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Utente Admin creato/verificato:', admin);

  // 2. Crea un cliente di prova
  try {
    const customer = await prisma.customer.create({
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
    console.log('Cliente di test creato:', customer);
  } catch {
    // FIX: Rimosso (e) perché non utilizzato
    console.log('Il cliente di test esiste già, proseguo...');
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