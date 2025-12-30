// prisma/seed.ts
import { PrismaClient, Role, LoyaltyLevel } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("GTService2025!", 12);

  // 1. Creazione Super Admin (TU)
  await prisma.user.upsert({
    where: { email: "giovanni@gtservice.it" },
    update: {},
    create: {
      email: "giovanni@gtservice.it",
      name: "Giovanni Tambuscio",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // 2. Creazione Clienti di Prova con diverse soglie Loyalty
  const customers = [
    {
      firstName: "Mario",
      lastName: "Rossi",
      phone: "3331122334",
      loyaltyLevel: LoyaltyLevel.PLATINUM,
      totalSpent: 5200.00,
      technicalNotes: "Cliente storico, esigente sui ricambi originali.",
    },
    {
      firstName: "Luca",
      lastName: "Bianchi",
      phone: "3409988776",
      loyaltyLevel: LoyaltyLevel.GOLD,
      totalSpent: 2100.50,
      technicalNotes: "Problemi frequenti al FAP.",
    },
    {
      firstName: "Anna",
      lastName: "Verdi",
      phone: "3285566443",
      loyaltyLevel: LoyaltyLevel.SILVER,
      totalSpent: 650.00,
      technicalNotes: "Tagliandi regolari ogni 15.000km.",
    }
  ];

  for (const c of customers) {
    await prisma.customer.create({ data: c });
  }

  console.log("Seed completato con successo!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });