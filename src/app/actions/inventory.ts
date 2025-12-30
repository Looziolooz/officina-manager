"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// Definizione del tipo per la transazione per evitare 'any'
type PrismaTransaction = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function decrementPartStockAction(jobId: string, partId: string, quantity: number) {
  const session = await auth();
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "MECHANIC")) {
    throw new Error("Permessi insufficienti.");
  }

  return await prisma.$transaction(async (tx: PrismaTransaction) => {
    const part = await tx.part.findUnique({ where: { id: partId } });
    
    if (!part || part.stock < quantity) {
      throw new Error("Scorte insufficienti.");
    }

    await tx.partOnJob.create({
      data: { jobId, partId, quantity }
    });

    return await tx.part.update({
      where: { id: partId },
      data: { stock: { decrement: quantity } }
    });
  });
}

export async function getQuickPartsStock() {
  const session = await auth();
  if (!session) return [];

  return await prisma.part.findMany({
    where: {
      code: { in: ["oil-id", "filter-id", "pads-id"] }
    },
    select: {
      id: true,
      code: true,
      stock: true
    }
  });
}