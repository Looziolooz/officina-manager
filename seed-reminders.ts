import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Inizio Seeding Dati di Test...");

  // 1. PULIZIA: Rimuove i dati vecchi per evitare conflitti
  try {
    await prisma.jobItem.deleteMany();
    await prisma.job.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    console.log("🧹 Database pulito.");
  } catch {
    // Abbiamo rimosso '(e)' qui perché non la usavamo, risolvendo l'errore ESLint
    console.log("⚠️ Pulizia saltata (DB forse già vuoto).");
  }

  // 2. CREA CLIENTE DI TEST
  const customer = await prisma.customer.create({
    data: {
      firstName: "Test",
      lastName: "User",
      email: "tuamail@esempio.com", // Metti la tua email vera se vuoi testare l'invio
      phone: "3330000000",
    }
  });

  const today = new Date();

  // 3. AUTO 1: SCADENZA OLIO (11 Mesi fa)
  const dateOil = new Date();
  dateOil.setMonth(today.getMonth() - 11);
  dateOil.setDate(today.getDate() - 2); 

  await prisma.vehicle.create({
    data: {
      plate: "OLIO-KO",
      model: "Ford Fiesta (Da Tagliandare)",
      customerId: customer.id,
      kmCount: 95000,
      lastRevisionDate: new Date(),
      lastOilChange: dateOil 
    }
  });

  // 4. AUTO 2: SCADENZA REVISIONE (23 Mesi fa)
  const dateRevision = new Date();
  dateRevision.setMonth(today.getMonth() - 23);
  dateRevision.setDate(today.getDate() - 2);

  await prisma.vehicle.create({
    data: {
      plate: "REV-KO",
      model: "Fiat Punto (Da Revisionare)",
      customerId: customer.id,
      kmCount: 140000,
      lastRevisionDate: dateRevision,
      lastOilChange: new Date()
    }
  });

  console.log("✅ DATI INSERITI CORRETTAMENTE!");
  console.log("   - Veicolo OLIO-KO: Scadenza Tagliando");
  console.log("   - Veicolo REV-KO:  Scadenza Revisione");
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