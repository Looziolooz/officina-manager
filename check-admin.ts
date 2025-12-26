import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Cerco l'utente admin@officina.it...");
  
  const user = await prisma.user.findUnique({
    where: { email: 'admin@officina.it' }
  });

  if (user) {
    console.log("✅ UTENTE TROVATO!");
    console.log(`ID: ${user.id}`);
    console.log(`Password Hash (inizio): ${user.password.substring(0, 10)}...`);
  } else {
    console.error("❌ UTENTE NON TROVATO. Il database è vuoto o l'email è sbagliata.");
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); });