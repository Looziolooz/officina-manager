import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("GTService2025!", 12);

  // 1. Creazione Super Admin
  // Upsert evita errori se l'utente esiste già
  await prisma.user.upsert({
    where: { email: "giovanni@gtservice.it" },
    update: {
      password: hashedPassword, // Aggiorna la password se l'utente esiste
      role: Role.SUPER_ADMIN,
    },
    create: {
      email: "giovanni@gtservice.it",
      name: "Giovanni Tambuscio",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // 2. Creazione Clienti di Prova
  // Nota: Abbiamo rimosso 'LoyaltyLevel' perché ora si calcola in base al 'totalSpent'
  const customers = [
    {
      firstName: "Mario",
      lastName: "Rossi",
      phone: "3331122334",
      totalSpent: 5200.00, // Questo determinerà che è un cliente "VIP"
      technicalNotes: "Cliente storico, esigente sui ricambi originali.",
    },
    {
      firstName: "Luca",
      lastName: "Bianchi",
      phone: "3409988776",
      totalSpent: 2100.50,
      technicalNotes: "Problemi frequenti al FAP.",
    },
    {
      firstName: "Anna",
      lastName: "Verdi",
      phone: "3285566443",
      totalSpent: 650.00,
      technicalNotes: "Tagliandi regolari ogni 15.000km.",
    }
  ];

  for (const c of customers) {
    // Evitiamo duplicati controllando il telefono
    const exists = await prisma.customer.findUnique({ where: { phone: c.phone } });
    
    if (!exists) {
      await prisma.customer.create({
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          totalSpent: c.totalSpent,
          technicalNotes: c.technicalNotes,
          // Altri campi opzionali vengono lasciati ai valori di default (null/0)
        }
      });
    }
  }

  console.log("✅ Seed completato con successo!");
}

main()
  .catch((e) => {
    console.error("❌ Errore durante il seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });