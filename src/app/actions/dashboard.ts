"use server";

import { prisma } from "@/lib/prisma";
import { JOB_STATUS } from "@/lib/constants";

export async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. FATTURATO MESE CORRENTE (Solo lavori completati/consegnati)
    const revenueAgg = await prisma.job.aggregate({
      where: {
        status: { in: [JOB_STATUS.COMPLETED, JOB_STATUS.DELIVERED] },
        endDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: { totalCost: true }
    });
    const monthlyRevenue = revenueAgg._sum.totalCost || 0;

    // 2. AUTO IN OFFICINA (Escludiamo schedulati futuri e consegnati)
    const carsInWorkshop = await prisma.job.count({
      where: {
        status: { in: [JOB_STATUS.IN_PROGRESS, JOB_STATUS.WAITING_PARTS] }
      }
    });

    // 3. SCORTE IN ESAURIMENTO (Magazzino)
    // Nota: Prisma non supporta confronto tra colonne (stock <= threshold) direttamente in modo semplice su tutti i DB,
    // ma possiamo filtrare quelli con stock basso fisso o usare raw query. 
    // Per semplicità e sicurezza su SQLite/Postgres standard:
    const lowStockParts = await prisma.part.count({
      where: {
        stockQuantity: { lte: 5 } // Soglia fissa o recupera tutti e filtra in JS se serve soglia dinamica
      }
    });

    // 4. LAVORI COMPLETATI (Mese corrente)
    const completedJobsCount = await prisma.job.count({
      where: {
        status: { in: [JOB_STATUS.COMPLETED, JOB_STATUS.DELIVERED] },
        endDate: { gte: startOfMonth }
      }
    });

    // 5. DATI GRAFICO (Ultimi 7 giorni)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));

      const dayRevenue = await prisma.job.aggregate({
        where: {
          status: { in: [JOB_STATUS.COMPLETED, JOB_STATUS.DELIVERED] },
          endDate: { gte: startOfDay, lte: endOfDay }
        },
        _sum: { totalCost: true }
      });

      // Nome giorno in Italiano (es: "Lun")
      const dayName = startOfDay.toLocaleDateString('it-IT', { weekday: 'short' });
      
      chartData.push({
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1), // Capitalizza (lun -> Lun)
        fatturato: dayRevenue._sum.totalCost || 0
      });
    }

    return {
      success: true,
      data: {
        monthlyRevenue,
        carsInWorkshop,
        lowStockParts,
        completedJobsCount,
        chartData
      }
    };

  } catch (error) {
    console.error("Errore Dashboard:", error);
    return { success: false, error: "Impossibile recuperare statistiche" };
  }
}