"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function searchCustomers(query: string) {
  const session = await auth();
  if (!session) throw new Error("Non autorizzato");

  return await prisma.customer.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { vehicles: { some: { plate: { contains: query, mode: 'insensitive' } } } }
      ]
    },
    include: {
      vehicles: true
    }
  });
}