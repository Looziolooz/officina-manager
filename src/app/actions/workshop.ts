"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JobStatus, MaintenanceType } from "@prisma/client";

// --- SCHEMAS ---

const createJobSchema = z.object({
  title: z.string().min(3, "Titolo richiesto"),
  description: z.string().optional(),
  vehicleId: z.string().min(1, "Seleziona un veicolo"),
  scheduledDate: z.coerce.date(),
  estimatedDuration: z.coerce.number().min(0).optional(),
  priority: z.coerce.number().int().min(0).max(2).default(0),
  kmAtEntry: z.coerce.number().int().min(0),
  fuelLevel: z.coerce.number().int().min(0).max(100).optional(),
  maintenanceType: z.nativeEnum(MaintenanceType).optional(),
});

// --- ACTIONS ---

export async function createJob(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // Gestione enum MaintenanceType se vuoto
  if (!rawData.maintenanceType || rawData.maintenanceType === "") {
      delete rawData.maintenanceType;
  }
  
  const result = createJobSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    let newJobId = "";

    await prisma.$transaction(async (tx) => {
      // 1. Recupera il veicolo per ottenere l'ownerId (Cliente)
      const vehicle = await tx.vehicle.findUnique({
        where: { id: data.vehicleId }
      });

      if (!vehicle) {
        throw new Error("Veicolo non trovato");
      }

      // Genera numero lavoro (es. JOB-2024-001)
      const count = await tx.job.count();
      const jobNumber = `JOB-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

      // 2. Crea Job
      const job = await tx.job.create({
        data: {
          jobNumber,
          title: data.title,
          description: data.description,
          vehicleId: data.vehicleId,
          customerId: vehicle.ownerId,
          kmAtEntry: data.kmAtEntry,
          fuelLevel: data.fuelLevel || 0,
          scheduledDate: data.scheduledDate,
          priority: data.priority,
          estimatedDuration: data.estimatedDuration,
          maintenanceType: data.maintenanceType || "OTHER",
          status: "SCHEDULED"
        },
      });
      
      newJobId = job.id;

      // 3. Aggiorna km veicolo se maggiori
      if (data.kmAtEntry > vehicle.totalKm) {
        await tx.vehicle.update({
          where: { id: vehicle.id },
          data: { totalKm: data.kmAtEntry }
        });
      }
    });

    if (newJobId) {
       // Controllo per redirect
    }

  } catch (error) {
    console.error("Errore creazione lavoro:", error);
    return { success: false, message: "Errore durante la creazione del lavoro" };
  }

  revalidatePath("/admin/workshop");
  redirect("/admin/workshop");
}

export async function updateJobStatus(jobId: string, newStatus: JobStatus) {
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus }
    });
    
    revalidatePath(`/admin/workshop/${jobId}`);
    revalidatePath("/admin/workshop");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore aggiornamento stato" };
  }
}

// --- HELPER PER IL FRONTEND ---
export async function getVehiclesForSelect() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        plate: true,
        model: true,
        brand: true,
        owner: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { plate: 'asc' }
    });
    return vehicles;
  } catch (error) {
    console.error(error);
    return [];
  }
}