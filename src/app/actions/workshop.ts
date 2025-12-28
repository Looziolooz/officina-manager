"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Crea un nuovo intervento in officina associando cliente e veicolo
 */
export async function createJob(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const familyNotes = formData.get("familyNotes") as string;
  const plate = (formData.get("plate") as string)?.toUpperCase().replace(/\s/g, '');
  const model = formData.get("model") as string;
  const year = parseInt(formData.get("year") as string) || null;
  const km = parseInt(formData.get("km") as string) || 0;
  const description = formData.get("description") as string;

  try {
    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone },
        update: { firstName, lastName, email, familyNotes },
        create: { firstName, lastName, phone, email, familyNotes },
      });

      const vehicle = await tx.vehicle.upsert({
        where: { plate },
        update: { model, year, kmCount: km, customerId: customer.id },
        create: { plate, model, year, kmCount: km, customerId: customer.id },
      });

      await tx.job.create({
        data: {
          vehicleId: vehicle.id,
          description,
          kmCount: km,
          status: "SCHEDULATO",
          scheduledDate: new Date(),
        },
      });
    });

    revalidatePath("/admin/officina");
    return { success: true };
  } catch (err) {
    console.error("Errore creazione lavoro:", err);
    return { success: false, error: "Errore durante il salvataggio dei dati." };
  }
}

/**
 * Aggiorna lo stato di avanzamento di un lavoro nella Kanban
 */
export async function updateJobStatus(jobId: string, newStatus: string) {
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus },
    });
    revalidatePath("/admin/officina");
    return { success: true };
  } catch (err) {
    console.error("Errore aggiornamento stato:", err);
    return { success: false };
  }
}

/**
 * ARCHIVIAZIONE AVANZATA: Chiude il lavoro, scarica lo stock definitivo, 
 * aggiorna i KM del veicolo e crea il record in contabilità per la dashboard.
 */
export async function archiveJob(jobId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Recupero dati completi del lavoro e relazioni
      const job = await tx.job.findUnique({
        where: { id: jobId },
        include: { 
          items: true,
          vehicle: { include: { customer: true } } 
        }
      });

      if (!job) throw new Error("Lavoro non trovato");

      // 2. Calcolo dei margini finanziari
      const totaleFatturato = job.totalCost;
      const costoRicambi = job.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
      const margineEffettivo = totaleFatturato - costoRicambi;

      // 3. Aggiornamento stato del lavoro
      await tx.job.update({
        where: { id: jobId },
        data: { 
          status: "ARCHIVIATO",
          endDate: new Date() 
        }
      });

      // 4. Creazione Record in Contabilità (AccountingRecord)
      // Questo dato alimenta i grafici della Dashboard
      await tx.accountingRecord.create({
        data: {
          jobId: job.id,
          customerId: job.vehicle.customer.id,
          amount: totaleFatturato,
          margin: margineEffettivo,
          type: "ENTRATA",
          category: "OFFICINA",
          description: `Intervento su ${job.vehicle.plate} - ${job.vehicle.model}`,
        }
      });

      // 5. Aggiornamento KM del veicolo
      await tx.vehicle.update({
        where: { id: job.vehicleId },
        data: { kmCount: job.kmCount }
      });

      // 6. Sincronizzazione Cache
      revalidatePath("/admin/officina");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/contabilita");
      revalidatePath(`/admin/clienti/${job.vehicle.customer.id}`);

      return { success: true };
    });
  } catch (err) {
    console.error("Errore archiviazione avanzata:", err);
    return { success: false };
  }
}

/**
 * Aggiunge un ricambio alla scheda lavoro e aggiorna temporaneamente lo stock
 */
export async function addPartToJob(jobId: string, partId: string, quantity: number = 1) {
  try {
    return await prisma.$transaction(async (tx) => {
      const part = await tx.part.findUnique({ where: { id: partId } });
      if (!part || part.stockQuantity < quantity) {
        throw new Error("Ricambio non trovato o stock insufficiente");
      }

      await tx.jobItem.create({
        data: {
          jobId,
          partId,
          description: part.name,
          quantity,
          unitPrice: part.sellPrice,
          unitCost: part.buyPrice,
        }
      });

      await tx.part.update({
        where: { id: partId },
        data: { stockQuantity: { decrement: quantity } }
      });

      // Ricalcolo totali del lavoro
      const allItems = await tx.jobItem.findMany({ where: { jobId } });
      const partsCost = allItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
      
      await tx.job.update({
        where: { id: jobId },
        data: { 
          partsCost,
          totalCost: { increment: part.sellPrice * quantity } 
        }
      });

      revalidatePath(`/admin/officina/${jobId}`);
      revalidatePath("/admin/magazzino");
      return { success: true };
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    console.error("Errore aggiunta ricambio:", message);
    return { success: false, error: message };
  }
}

/**
 * Aggiorna le note del cliente (Interne e Familiari)
 */
export async function updateCustomerNotes(
  customerId: string, 
  familyNotes: string = "", 
  notes: string = ""
) {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { 
        familyNotes,
        notes 
      },
    });
    
    revalidatePath(`/admin/clienti/${customerId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Errore aggiornamento note:", error);
    return { success: false, error: "Impossibile salvare le note." };
  }
}