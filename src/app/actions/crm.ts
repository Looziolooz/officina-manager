"use server";

import { prisma } from "@/lib/prisma";

export async function searchCustomers(query: string) {
  if (!query || query.length < 2) return [];

  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { phone: { contains: query } },
          { 
            vehicles: { 
              some: { plate: { contains: query.toUpperCase().replace(/\s/g, '') } } 
            } 
          }
        ],
      },
      include: {
        vehicles: true // Includiamo i veicoli per popolare l'anno se già noto
      },
      take: 5,
    });
    return customers;
  } catch (error) {
    console.error("Errore ricerca avanzata:", error);
    return [];
  }
}