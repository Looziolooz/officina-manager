// src/app/actions/dashboard.ts
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await auth();
  if (!session) throw new Error("Non autorizzato");

  // Calcolo inizio e fine giornata odierna senza librerie esterne
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  try {
    const dailyJobs = await prisma.job.findMany({
      where: {
        updatedAt: { gte: start, lte: end },
        status: { in: ["PRONTO", "CONSEGNATO"] }
      },
      include: {
        parts: {
          include: { part: true }
        }
      }
    });

    const revenue = dailyJobs.reduce((sum, job) => sum + job.totalAmount, 0);

    const partsCount = dailyJobs.reduce((sum, job) => 
      sum + job.parts.reduce((pSum, p) => pSum + p.quantity, 0), 0
    );

    const margin = dailyJobs.reduce((sum, job) => {
      const partsMargin = job.parts.reduce((pSum, p) => {
        const cost = p.part.buyPrice * p.quantity;
        const sold = p.appliedPrice * p.quantity;
        return pSum + (sold - cost);
      }, 0);
      return sum + partsMargin + job.laborCost;
    }, 0);

    return {
      revenue,
      partsUsed: partsCount,
      jobsDone: dailyJobs.length,
      margin
    };
  } catch (error) {
    console.error("Errore recupero stats:", error);
    return { revenue: 0, partsUsed: 0, jobsDone: 0, margin: 0 };
  }
}