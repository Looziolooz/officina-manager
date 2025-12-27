"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    console.error(err);
    return { success: false, error: "Errore durante il salvataggio." };
  }
}

export async function updateJobStatus(jobId: string, newStatus: string) {
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus },
    });
    revalidatePath("/admin/officina");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}

export async function archiveJob(jobId: string) {
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "ARCHIVIATO" },
    });
    revalidatePath("/admin/officina");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}
export async function updateCustomerNotes(customerId: string, familyNotes: string, notes: string) {
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
  } catch (error) {
    console.error("Errore aggiornamento note:", error);
    return { success: false, error: "Impossibile salvare le note." };
  }
}