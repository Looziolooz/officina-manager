// fix-auth.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('GTService2025!', 12);
  
  // Rimosso l'assegnamento alla variabile 'user' inutilizzata
  await prisma.user.upsert({
    where: { email: 'giovanni@gtservice.it' },
    update: { 
      password: password,
      role: 'SUPER_ADMIN' 
    },
    create: {
      email: 'giovanni@gtservice.it',
      name: 'Giovanni Tambuscio',
      password: password,
      role: 'SUPER_ADMIN',
    },
  });
  
  console.log('✅ Utente Giovanni creato o aggiornato con successo nel database!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il fix:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });