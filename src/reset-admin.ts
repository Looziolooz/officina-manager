import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Importa bcryptjs

const prisma = new PrismaClient();

async function main() {
  const email = 'giovanni@gtservice.it';
  const passwordPlain = 'GTService2025!'; 
  
  console.log(`🔄 Avvio reset utente: ${email}...`);

  // Genera l'hash della password
  const hashedPassword = await bcrypt.hash(passwordPlain, 12);

  // 1. Rimuovi l'utente se esiste
  try {
    await prisma.user.delete({ where: { email } });
    console.log('🗑️  Utente precedente eliminato.');
  } catch {
    console.log('ℹ️  L\'utente non esisteva, procedo alla creazione.');
  }

  // 2. Crea l'utente con password CRIPTATA
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Giovanni Admin',
      password: hashedPassword, // Usa l'hash, NON la password in chiaro
      role: 'SUPER_ADMIN',
      
      isActive: true,
      isLocked: false,
      lockedUntil: null,
      loginAttempts: 0,
      mustChangePassword: false,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  console.log('✅ Utente Admin ricreato con successo!');
  console.log('------------------------------------------------');
  console.log(`📧 Email:    ${user.email}`);
  console.log(`🔑 Password: ${passwordPlain}`); // Mostra quella in chiaro solo nel log per comodità
  console.log(`🛡️  Ruolo:    ${user.role}`);
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