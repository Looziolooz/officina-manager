"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addJobItem(formData: FormData) {
  const jobId = formData.get("jobId") as string;
  const description = formData.get("description") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0;
  const unitCost = parseFloat(formData.get("unitCost") as string) || 0;
  
  const rawPartId = formData.get("partId") as string | null;

  try {
    await prisma.$transaction(async (tx) => {
      // Creazione della voce
      await tx.jobItem.create({
        data: {
          jobId,
          // Se rawPartId è nullo o stringa vuota, passiamo null. 
          // Prisma lo accetterà se hai eseguito 'prisma generate' con 'partId String?'
          partId: (rawPartId && rawPartId !== "") ? rawPartId : null,
          description,
          quantity,
          unitPrice,
          unitCost,
        },
      });

      // Aggiornamento stock se è un pezzo reale
      if (rawPartId && rawPartId !== "") {
        await tx.part.update({
          where: { id: rawPartId },
          data: { stockQuantity: { decrement: quantity } },
        });
      }

      // Ricalcolo totali
      const allItems = await tx.jobItem.findMany({ where: { jobId } });

      const partsCost = allItems
        .filter(i => i.partId !== null)
        .reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);

      const laborCost = allItems
        .filter(i => i.partId === null)
        .reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);

      await tx.job.update({
        where: { id: jobId },
        data: {
          partsCost,
          laborCost,
          totalCost: partsCost + laborCost,
        },
      });
    });

    revalidatePath(`/admin/officina/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("Errore:", error);
    return { success: false, error: "Errore durante l'inserimento" };
  }
}