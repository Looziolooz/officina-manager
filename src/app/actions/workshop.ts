// src/app/actions/workshop.ts
"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { JOB_STATUS } from "@/lib/constants";

// 1. LEGGI: Recupera lavori per la Kanban (Esclude i consegnati per pulizia)
export async function getKanbanJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: {
          not: JOB_STATUS.DELIVERED // Mostriamo tutto tranne ciò che è già uscito dall'officina
        }
      },
      include: {
        vehicle: {
          include: { customer: true }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });
    return { success: true, data: jobs };
  } catch (error) {
    console.error("Errore recupero lavori:", error);
    return { success: false, data: [] };
  }
}

// 2. AGGIORNA STATO (Drag & Drop)
export async function updateJobStatus(jobId: string, newStatus: string) {
  try {
    const now = new Date();
    let dateUpdate = {};
    
    // Aggiorna le date chiave in base allo stato
    if (newStatus === JOB_STATUS.IN_PROGRESS) {
      dateUpdate = { startDate: now };
    } else if (newStatus === JOB_STATUS.COMPLETED) {
      dateUpdate = { endDate: now };
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { 
        status: newStatus,
        ...dateUpdate
      }
    });

    revalidatePath("/admin/officina");
    return { success: true };
  } catch (error) {
    console.error("Errore aggiornamento stato:", error);
    return { success: false, error: "Impossibile aggiornare lo stato" };
  }
}

// 3. CREA: Nuovo ingresso (Logica completa)
export async function createJob(formData: FormData) {
  const plate = (formData.get("plate") as string)?.toUpperCase().replace(/\s/g, '');
  const model = formData.get("model") as string;
  const description = formData.get("description") as string;
  
  // Dati cliente
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string; 
  const phone = formData.get("phone") as string;

  // Gestione Km
  const kmInput = formData.get("km");
  const km = kmInput ? parseInt(kmInput as string) : 0;

  if (!plate || !firstName || !lastName || !phone) {
    return { success: false, error: "Dati obbligatori mancanti" };
  }

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // A. Trova o Crea Cliente
      const customer = await tx.customer.upsert({
        where: { phone: phone },
        update: { firstName, lastName },
        create: {
          firstName,
          lastName,
          phone,
          email: `temp-${Date.now()}@no-mail.com` // Email temporanea se non fornita
        }
      });

      // B. Trova o Crea Veicolo
      const vehicle = await tx.vehicle.upsert({
        where: { plate: plate },
        update: { kmCount: km, customerId: customer.id },
        create: {
          plate,
          model,
          customerId: customer.id,
          kmCount: km
        }
      });

      // C. Crea Scheda Lavoro
      await tx.job.create({
        data: {
          vehicleId: vehicle.id,
          description,
          kmCount: km,
          status: JOB_STATUS.SCHEDULED, // Parte come Schedulato
          scheduledDate: new Date()     // Data prevista: oggi
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

// 4. AGGIORNA NOTE CLIENTE (Reintegrato per compatibilità con pagina Clienti)
export async function updateCustomerNotes(customerId: string, notes: string) {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { notes }
    });
    revalidatePath(`/admin/clienti/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Errore salvataggio note:", error);
    return { success: false, error: "Errore salvataggio note" };
  }
}