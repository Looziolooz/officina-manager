// src/lib/actions/customer.actions.ts
"use server";

import { prisma } from "@/lib/db";

export async function getCustomers(query: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { vehicles: { some: { plate: { contains: query, mode: 'insensitive' } } } }
        ]
      },
      include: {
        vehicles: true,
        _count: {
          select: { 
            // Conta i lavori totali attraverso i veicoli
            // Nota: Se vuoi il conteggio totale lavori, dovrai mappare i veicoli
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });
    return customers;
  } catch (error) {
    console.error("Errore ricerca clienti:", error);
    return [];
  }
}