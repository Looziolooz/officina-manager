"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // [!code ++] Import fondamentale
import { revalidatePath } from "next/cache";

// 1. AGGIUNGI PEZZO AL LAVORO (e scarica magazzino)
export async function addPartToJob(jobId: string, partId: string, quantity: number) {
  try {
    // [!code warning] Aggiunto tipo esplicito a tx
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // a. Recupera il pezzo per prezzo e disponibilità
      const part = await tx.part.findUnique({ where: { id: partId } });
      if (!part) throw new Error("Pezzo non trovato");
      if (part.stockQuantity < quantity) throw new Error("Quantità insufficiente in magazzino");

      // b. Scarica il magazzino
      await tx.part.update({
        where: { id: partId },
        data: { stockQuantity: part.stockQuantity - quantity }
      });

      // c. Aggiungi riga al Job
      await tx.jobItem.create({
        data: {
          jobId,
          partId,
          quantity,
          unitPrice: part.sellPrice // Blocchiamo il prezzo al momento dell'uso
        }
      });

      // d. Ricalcola totali Job
      await recalculateJobTotals(tx, jobId);
    });

    revalidatePath(`/admin/officina/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("Errore aggiunta pezzo:", error);
    return { success: false, error: "Errore durante l'aggiunta del ricambio" };
  }
}

// 2. RIMUOVI PEZZO DAL LAVORO (e ricarica magazzino)
export async function removePartFromJob(itemId: string, jobId: string) {
  try {
    // [!code warning] Aggiunto tipo esplicito a tx
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // a. Trova l'item per sapere quantità e pezzo
      const item = await tx.jobItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Riga non trovata");

      // b. Ricarica il magazzino (annulla scarico)
      await tx.part.update({
        where: { id: item.partId },
        data: { stockQuantity: { increment: item.quantity } }
      });

      // c. Elimina riga
      await tx.jobItem.delete({ where: { id: itemId } });

      // d. Ricalcola totali
      await recalculateJobTotals(tx, jobId);
    });

    revalidatePath(`/admin/officina/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("Errore rimozione pezzo:", error);
    return { success: false, error: "Impossibile rimuovere il pezzo" };
  }
}

// 3. AGGIORNA MANODOPERA
export async function updateLabor(jobId: string, laborCost: number) {
  try {
    // [!code warning] Aggiunto tipo esplicito a tx
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.job.update({
        where: { id: jobId },
        data: { laborCost }
      });
      await recalculateJobTotals(tx, jobId);
    });

    revalidatePath(`/admin/officina/${jobId}`);
    return { success: true };
  } catch (error) {
    // [!code warning] Ora usiamo l'errore per evitare l'avviso ESLint
    console.error("Errore updateLabor:", error);
    return { success: false, error: "Errore aggiornamento manodopera" };
  }
}

// HELPER: Ricalcolo Totali
// [!code warning] Aggiunto tipo esplicito a tx
async function recalculateJobTotals(tx: Prisma.TransactionClient, jobId: string) {
  const job = await tx.job.findUnique({
    where: { id: jobId },
    include: { items: true }
  });

  if (!job) return;

  // [!code warning] Aggiunto tipo esplicito a item per evitare 'any' implicito
  const partsCost = job.items.reduce((acc: number, item: { unitPrice: number; quantity: number }) => acc + (item.unitPrice * item.quantity), 0);
  const totalCost = partsCost + job.laborCost;

  await tx.job.update({
    where: { id: jobId },
    data: { partsCost, totalCost }
  });
}