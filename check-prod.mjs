// check-prod.mjs
import { PrismaClient } from '@prisma/client';

// Inizializza il client
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifica connessione al DB di Produzione...");
  
  try {
    // Cerchiamo l'utente
    const user = await prisma.user.findUnique({
      where: { email: 'giovanni@gtservice.it' }
    });

    if (user) {
      console.log("✅ Utente TROVATO in produzione:");
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Hash Password: ${user.password.substring(0, 15)}...`); // Vediamo se inizia con $2a o $2b
      console.log(`- Ruolo: ${user.role}`);
      console.log(`- Bloccato: ${user.isLocked}`);
    } else {
      console.error("❌ ERRORE CRITICO: L'utente 'giovanni@gtservice.it' NON ESISTE nel database remoto.");
      console.log("👉 Devi eseguire lo script 'fix-auth.mjs' puntando a questo database.");
    }
  } catch (e) {
    console.error("❌ Errore di connessione al DB:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();