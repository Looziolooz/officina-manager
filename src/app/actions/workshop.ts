"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { JobStatus, Prisma, MaintenanceType } from "@prisma/client";
import { z } from "zod";
// Importazione per le notifiche WhatsApp
import { sendWhatsAppNotification } from "@/lib/whatsapp";

// --- VALIDATION SCHEMAS ---

const CreateJobSchema = z.object({
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri"),
  description: z.string().optional(),
  vehicleId: z.string(),
  kmAtEntry: z.number().min(0, "I KM non possono essere negativi"),
  scheduledDate: z.date(),
  priority: z.number().min(0).max(2).default(0),
  maintenanceType: z.string().optional(),
  estimatedDuration: z.number().optional()
});

type CreateJobData = z.infer<typeof CreateJobSchema>;

// --- SERVER ACTIONS ---

/**
 * Crea un nuovo lavoro in officina e aggiorna i KM del veicolo
 */
export async function createJob(data: CreateJobData) {
  const validation = CreateJobSchema.safeParse(data);
  
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Genera numero Job progressivo (Es: JOB-2024-001)
      const lastJob = await tx.job.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { jobNumber: true }
      });
      
      const year = new Date().getFullYear();
      let nextNum = 1;
      if (lastJob) {
        const parts = lastJob.jobNumber.split('-');
        if (parts.length === 3 && parseInt(parts[1]) === year) {
          nextNum = parseInt(parts[2]) + 1;
        }
      }
      const jobNumber = `JOB-${year}-${String(nextNum).padStart(3, '0')}`;

      // 2. Crea Job
      const job = await tx.job.create({
        data: {
          jobNumber,
          title: data.title,
          description: data.description,
          vehicleId: data.vehicleId,
          kmAtEntry: data.kmAtEntry,
          scheduledDate: data.scheduledDate,
          priority: data.priority,
          estimatedDuration: data.estimatedDuration,
          // Cast sicuro all'enum o undefined
          maintenanceType: (data.maintenanceType as MaintenanceType) || undefined, 
        }
      });

      // 3. Aggiorna KM attuali del veicolo
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { totalKm: data.kmAtEntry }
      });

      return job;
    });

    revalidatePath('/admin/workshop');
    return { success: true, jobId: result.id };
  } catch (e) {
    console.error("Errore creazione job:", e);
    return { success: false, error: "Errore durante la creazione del lavoro." };
  }
}

/**
 * Aggiorna lo stato del lavoro, calcola i margini e invia notifiche WhatsApp
 */
export async function updateJobStatus(jobId: string, newStatus: JobStatus) {
  const now = new Date();
  const updateData: Prisma.JobUpdateInput = { status: newStatus };

  try {
    if (newStatus === 'IN_PROGRESS') {
      updateData.startedAt = now;
    } else if (newStatus === 'COMPLETED') {
      updateData.completedAt = now;

      // 1. Recuperiamo il job CON i dati del cliente per calcolare margini E inviare WhatsApp
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { 
          vehicle: { 
            include: { owner: true } // Necessario per prendere telefono e nome
          },
          parts: { include: { part: true } } 
        }
      });

      if (job) {
        // --- LOGICA CALCOLO MARGINI ---
        const partsCostTotal = job.parts.reduce((sum, p) => 
          sum + (p.part.buyPrice * p.quantity), 0
        );
        const partsRevenueTotal = job.parts.reduce((sum, p) => 
          sum + (p.appliedPrice * p.quantity * (1 - p.discount / 100)), 0
        );
        const laborRevenue = job.laborCost;
        
        // Margine = Ricavi totali (Manodopera + Ricambi scontati) - Costi vivi ricambi
        updateData.margin = (partsRevenueTotal + laborRevenue) - partsCostTotal;

        // --- INTEGRAZIONE WHATSAPP ---
        // Controlliamo se il cliente ha un numero di telefono
        if (job.vehicle.owner.phone) {
          // Nota: In un ambiente serverless puro (es. Vercel Functions), idealmente si userebbe `await`
          // o `waitUntil` (se disponibile) per garantire l'invio prima che la funzione termini.
          // Qui lo chiamiamo senza await per non bloccare l'UI dell'operatore, assumendo che il runtime
          // viva abbastanza a lungo o che l'errore di invio non debba bloccare il salvataggio DB.
          sendWhatsAppNotification(
            job.vehicle.owner.phone, 
            job.vehicle.owner.firstName, 
            job.vehicle.plate
          ).catch(err => console.error("Fallimento invio background WhatsApp:", err));
        }
      }
    } else if (newStatus === 'DELIVERED') {
      updateData.deliveredAt = now;
    }

    // Esegue l'aggiornamento nel DB
    await prisma.job.update({
      where: { id: jobId },
      data: updateData
    });

    revalidatePath('/admin/workshop');
    return { success: true };
  } catch (error) {
    console.error("Errore update status:", error);
    return { success: false, error: "Errore durante l'aggiornamento dello stato." };
  }
}

/**
 * Aggiunge un ricambio al lavoro, scaricando il magazzino e congelando il prezzo
 */
export async function addPartToJob(jobId: string, partId: string, quantity: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Verifica disponibilità ricambio
    const part = await tx.part.findUnique({ where: { id: partId } });
    if (!part) throw new Error("Ricambio non trovato");
    if (part.stock < quantity) throw new Error("Stock insufficiente in magazzino");

    // 2. Aggiunge il ricambio al lavoro (congelando il prezzo di vendita attuale)
    await tx.partOnJob.create({
      data: {
        jobId,
        partId,
        quantity,
        appliedPrice: part.sellPrice,
        discount: 0
      }
    });

    // 3. Decrementa lo stock
    await tx.part.update({
      where: { id: partId },
      data: { stock: { decrement: quantity } }
    });

    // 4. Ricalcola i totali del lavoro
    const allParts = await tx.partOnJob.findMany({ where: { jobId } });
    const partsTotal = allParts.reduce((sum, p) => 
      sum + (p.appliedPrice * p.quantity * (1 - p.discount / 100)), 0
    );

    const job = await tx.job.findUnique({ where: { id: jobId } });
    const totalAmount = partsTotal + (job?.laborCost || 0);

    // 5. Aggiorna i totali nel record Job
    await tx.job.update({
      where: { id: jobId },
      data: { 
        partsCost: partsTotal,
        totalAmount
      }
    });

    return { success: true };
  });
}