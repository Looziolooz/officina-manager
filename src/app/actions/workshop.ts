"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; 
import { revalidatePath } from "next/cache";
import { JOB_STATUS } from "@/lib/constants"; 

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

// 2. CREA: Nuovo ingresso (Con Cognome, Telefono e Km)
export async function createJob(formData: FormData) {
  const plate = (formData.get("plate") as string)?.toUpperCase().replace(/\s/g, '');
  const model = formData.get("model") as string;
  const description = formData.get("description") as string;
  
  // Gestione Km
  const kmInput = formData.get("km");
  const km = kmInput ? parseInt(kmInput as string) : 0;
  
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string; 
  const phone = formData.get("phone") as string;

  if (!plate || !firstName || !lastName || !phone) {
    return { success: false, error: "Dati obbligatori mancanti" };
  }

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // A. Trova o Crea Cliente (con Cognome)
      const customer = await tx.customer.upsert({
        where: { phone: phone },
        update: { 
          firstName, 
          lastName 
        },
        create: {
          firstName,
          lastName,
          phone,
          email: `temp-${Date.now()}@no-mail.com`
        }
      });

      // B. Trova o Crea Veicolo (con Km)
      const vehicle = await tx.vehicle.upsert({
        where: { plate: plate },
        update: { kmCount: km },
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

// 3. AGGIORNA: Cambia stato lavoro
export async function updateJobStatus(jobId: string, newStatus: string) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // A. Aggiorna lo stato del lavoro
      const job = await tx.job.update({
        where: { id: jobId },
        data: { 
          status: newStatus,
          endDate: newStatus === JOB_STATUS.DELIVERED ? new Date() : null
        },
        include: { vehicle: true }
      });

      // B. Logica Fidelizzazione (Aggiorna date veicolo se necessario)
      if (newStatus === JOB_STATUS.DELIVERED) {
        const desc = job.description.toLowerCase();
        const isTagliando = desc.includes("tagliando") || desc.includes("olio");
        const isRevisione = desc.includes("revisione");

        if (isTagliando || isRevisione) {
          await tx.vehicle.update({
            where: { id: job.vehicleId },
            data: {
              lastOilChange: isTagliando ? new Date() : job.vehicle.lastOilChange,
              lastRevisionDate: isRevisione ? new Date() : job.vehicle.lastRevisionDate
            }
          });
        }
      }
    });

    revalidatePath("/admin/officina");
    revalidatePath("/admin/clienti");
    return { success: true };
  } catch (error) {
    console.error("Errore update status:", error);
    return { success: false, error: "Errore aggiornamento stato" };
  }
}

// 4. NUOVO: Aggiorna Note Cliente
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