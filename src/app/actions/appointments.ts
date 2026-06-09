"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { AppointmentType, AppointmentStatus } from "@prisma/client";
import { appointmentSchema } from "@/lib/schemas";
import type { AppointmentFormData } from "@/lib/schemas";

// 1. CREA NUOVO APPUNTAMENTO
export async function createAppointment(data: AppointmentFormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Non autenticato" };

  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { startAt, endAt, type, notes, customerId, vehicleId, walkInName, walkInPhone, walkInPlate } = parsed.data;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        startAt,
        endAt,
        type: type as AppointmentType,
        notes,
        customerId: customerId || null,
        vehicleId: vehicleId || null,
        walkInName: walkInName || null,
        walkInPhone: walkInPhone || null,
        walkInPlate: walkInPlate || null,
        createdById: session.user.id,
      },
    });

    revalidatePath("/admin/calendar");
    return { success: true, data: appointment };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore durante la creazione dell'appuntamento" };
  }
}

// 2. AGGIORNA APPUNTAMENTO
export async function updateAppointment(id: string, data: Partial<AppointmentFormData>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Non autenticato" };

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        type: data.type ? data.type as AppointmentType : undefined,
      },
    });

    revalidatePath("/admin/calendar");
    return { success: true, data: appointment };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore durante l'aggiornamento" };
  }
}

// 3. ELIMINA APPUNTAMENTO
export async function deleteAppointment(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Non autenticato" };

  try {
    await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore durante l'eliminazione" };
  }
}

// 4. OTTIENI APPUNTAMENTI IN UN RANGE
export async function getAppointmentsInRange(startDate: Date, endDate: Date) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        vehicle: true,
        job: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    return { success: true, data: appointments };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

// 5. CONVERTI APPUNTAMENTO IN JOB
export async function convertAppointmentToJob(appointmentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Non autenticato" };

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true, vehicle: true },
    });

    if (!appointment) return { success: false, message: "Appuntamento non trovato" };

    // Crea il Job
    const year = new Date().getFullYear();
    const lastJob = await prisma.job.findFirst({
      where: { jobNumber: { startsWith: `JO-${year}` } },
      orderBy: { createdAt: 'desc' }
    });
    const nextNum = lastJob ? parseInt(lastJob.jobNumber.split('-')[2] || '0') + 1 : 1;
    const jobNumber = `JO-${year}-${String(nextNum).padStart(3, '0')}`;
    
    const job = await prisma.job.create({
      data: {
        jobNumber,
        title: appointment.notes || "Lavoro da appuntamento",
        status: "IN_PROGRESS",
        scheduledDate: appointment.startAt,
        kmAtEntry: appointment.vehicle?.totalKm || 0,
        vehicleId: appointment.vehicleId || "",
        customerId: appointment.customerId || "",
      },
    });

    // Collega l'appuntamento al job
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        jobId: job.id,
        status: "IN_PROGRESS" as AppointmentStatus,
      },
    });

    revalidatePath("/admin/calendar");
    revalidatePath("/admin/workshop");
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore durante la conversione" };
  }
}
