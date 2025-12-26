"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; 
import { revalidatePath } from "next/cache";

// Definiamo le costanti manualmente per gli stati (sostituisce l'Enum)
export const JOB_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_PARTS: "WAITING_PARTS",
  COMPLETED: "COMPLETED",
  DELIVERED: "DELIVERED"
};

// 1. LEGGI: Recupera i lavori (Escludendo quelli già consegnati/archiviati)
export async function getJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: {
          not: JOB_STATUS.DELIVERED 
        }
      },
      include: {
        vehicle: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });
    return { success: true, data: jobs };
  } catch (error) {
    console.error("Errore recupero lavori:", error);
    return { success: false, data: [] };
  }
}

// 2. CREA: Nuovo ingresso con transazione (Cliente + Veicolo + Job)
export async function createJob(formData: FormData) {
  const plate = (formData.get("plate") as string)?.toUpperCase().replace(/\s/g, '');
  const model = formData.get("model") as string;
  const description = formData.get("description") as string;
  
  // Gestione sicura del numero km
  const kmInput = formData.get("km");
  const km = kmInput ? parseInt(kmInput as string) : 0;
  
  const firstName = formData.get("firstName") as string;
  const phone = formData.get("phone") as string;

  if (!plate || !firstName || !phone) {
    return { success: false, error: "Dati obbligatori mancanti" };
  }

  try {
    // Usiamo una transazione per garantire che o salva tutto o nulla
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // 1. Trova o Crea Cliente
      const customer = await tx.customer.upsert({
        where: { phone: phone },
        update: { firstName },
        create: {
          firstName,
          lastName: "", // Opzionale per velocità
          phone,
          email: `temp-${Date.now()}@no-mail.com` // Placeholder
        }
      });

      // 2. Trova o Crea Veicolo
      const vehicle = await tx.vehicle.upsert({
        where: { plate: plate },
        update: { kmCount: km },
        create: {
          plate,
          model,
          customerId: customer.id
        }
      });

      // 3. Crea Scheda Lavoro
      await tx.job.create({
        data: {
          vehicleId: vehicle.id,
          description,
          kmCount: km,
          status: JOB_STATUS.PENDING
        }
      });
    });

    revalidatePath("/admin/officina");
    return { success: true };
  } catch (error) {
    console.error("Errore creazione job:", error);
    return { success: false, error: "Errore durante il salvataggio" };
  }
}

// 3. AGGIORNA: Cambia stato e gestisce AUTOMAZIONE SCADENZE (Step 7)
export async function updateJobStatus(jobId: string, newStatus: string) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // A. Aggiorna lo stato del lavoro
      const job = await tx.job.update({
        where: { id: jobId },
        data: { 
          status: newStatus,
          // Se lo stato è DELIVERED, salviamo la data di fine lavori oggi
          endDate: newStatus === JOB_STATUS.DELIVERED ? new Date() : null
        },
        include: { vehicle: true } // Ci serve il veicolo per aggiornare le scadenze
      });

      // B. LOGICA FIDELIZZAZIONE: Se il lavoro è CONSEGNATO, aggiorniamo le date del veicolo
      if (newStatus === JOB_STATUS.DELIVERED) {
        const desc = job.description.toLowerCase();
        
        // Cerca parole chiave nella descrizione (tagliando, olio, revisione)
        const isTagliando = desc.includes("tagliando") || desc.includes("olio");
        const isRevisione = desc.includes("revisione");

        if (isTagliando || isRevisione) {
          await tx.vehicle.update({
            where: { id: job.vehicleId },
            data: {
              // Se era un tagliando, aggiorna la data ultimo tagliando a OGGI
              lastOilChange: isTagliando ? new Date() : job.vehicle.lastOilChange,
              // Se era una revisione, aggiorna la data ultima revisione a OGGI
              lastRevisionDate: isRevisione ? new Date() : job.vehicle.lastRevisionDate
            }
          });
        }
      }
    });

    // Aggiorniamo sia la bacheca officina che la lista clienti (per i bollini rossi/verdi)
    revalidatePath("/admin/officina");
    revalidatePath("/admin/clienti");
    return { success: true };
  } catch (error) {
    console.error("Errore update status:", error);
    return { success: false, error: "Errore aggiornamento stato" };
  }
}