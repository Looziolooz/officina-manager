import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = 'giovanni@gtservice.it';
  const password = 'GTService2025!'; // Password in chiaro per ora

  console.log(`🔄 Avvio reset utente: ${email}...`);

  // 1. Rimuovi l'utente se esiste (pulizia radicale)
  try {
    await prisma.user.delete({ where: { email } });
    console.log('🗑️  Utente precedente eliminato.');
  } catch {
    // Rimosso 'e' perché non utilizzato. Ignoriamo se l'utente non esiste.
    console.log('ℹ️  L\'utente non esisteva, procedo alla creazione.');
  }

  // 2. Crea l'utente con TUTTI i flag di sicurezza impostati correttamente
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Giovanni Admin',
      password: password, 
      role: 'SUPER_ADMIN',
      
      // Security Flags espliciti (IMPORTANTE)
      isActive: true,
      isLocked: false,
      lockedUntil: null,
      loginAttempts: 0,
      mustChangePassword: false,
      twoFactorEnabled: false, // Disabilitiamo 2FA per il primo accesso
      twoFactorSecret: null,
    },
  });

  console.log('✅ Utente Admin ricreato con successo!');
  console.log('------------------------------------------------');
  console.log(`📧 Email:    ${user.email}`);
  console.log(`🔑 Password: ${user.password}`);
  console.log(`🛡️  Ruolo:    ${user.role}`);
  console.log(`🔓 Stato:    Sbloccato, 2FA Disabilitato`);
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error("❌ Errore durante il reset:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });