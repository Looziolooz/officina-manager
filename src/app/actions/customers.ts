"use server";

import { prisma } from "@/lib/prisma";

export async function getAdvancedCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        vehicles: {
          include: {
            jobs: {
              where: { status: "ARCHIVIATO" },
              select: { totalCost: true, endDate: true }
            }
          }
        },
        accountingRecords: {
          where: { type: "ENTRATA" },
          select: { amount: true, margin: true }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    return customers.map(c => {
      const totalSpent = c.accountingRecords.reduce((sum, r) => sum + r.amount, 0);
      const totalMargin = c.accountingRecords.reduce((sum, r) => sum + r.margin, 0);
      const lastVisit = c.vehicles.flatMap(v => v.jobs)
                         .sort((a, b) => (b.endDate?.getTime() || 0) - (a.endDate?.getTime() || 0))[0]?.endDate;

      return {
        ...c,
        stats: {
          totalSpent,
          totalMargin,
          lastVisit,
          vehicleCount: c.vehicles.length,
          loyaltyScore: totalSpent > 1000 ? 'PLATINUM' : totalSpent > 500 ? 'GOLD' : 'STANDARD'
        }
      };
    });
  } catch (error) {
    console.error("Errore recupero clienti avanzati:", error);
    return [];
  }
}