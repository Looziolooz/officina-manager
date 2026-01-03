// fix-auth.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🔓 Sblocco account admin e reset password in corso...");
  
  const password = await bcrypt.hash('GTService2025!', 12);

  // Usiamo update per forzare lo sblocco su un utente esistente
  await prisma.user.update({
    where: { email: 'giovanni@gtservice.it' },
    data: {
      password: password,
      role: 'SUPER_ADMIN',
      isLocked: false,       // <--- IMPORTANTE: Sblocca l'utente
      lockedUntil: null,     // <--- IMPORTANTE: Rimuove il timeout
      loginAttempts: 0,      // <--- IMPORTANTE: Resetta i tentativi
      emailVerified: new Date() // Opzionale: conferma l'email se richiesto
    },
  });
  
  console.log("✅ Account SBLOCCATO e password ripristinata con successo!");
}

main()
  .catch((e) => {
    console.error("❌ Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });