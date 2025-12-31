"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

interface CreateJobInput {
  vehicleId: string;
  title: string;
  description?: string;
  laborCost: number;
  parts: {
    partId: string;
    quantity: number;
    appliedPrice: number;
  }[];
}

export async function createWorkshopJob(data: CreateJobInput) {
  const session = await auth();
  if (!session) throw new Error("Non autorizzato");

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const totalAmount = data.parts.reduce((sum, p) => sum + (p.appliedPrice * p.quantity), 0) + data.laborCost;

      const job = await tx.job.create({
        data: {
          title: data.title,
          description: data.description,
          status: "ACCETTAZIONE",
          vehicleId: data.vehicleId,
          laborCost: data.laborCost,
          totalAmount: totalAmount,
        },
      });

      for (const p of data.parts) {
        const part = await tx.part.findUnique({ where: { id: p.partId } });
        if (!part || part.stock < p.quantity) {
          throw new Error(`Stock insufficiente per: ${part?.name || p.partId}`);
        }

        await tx.partOnJob.create({
          data: {
            jobId: job.id,
            partId: p.partId,
            quantity: p.quantity,
            appliedPrice: p.appliedPrice,
          },
        });

        await tx.part.update({
          where: { id: p.partId },
          data: { stock: { decrement: p.quantity } },
        });
      }
      return job;
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/inventory");
    return { success: true, jobId: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return { success: false, error: message };
  }
}