"use server";

import { prisma } from "@/lib/prisma";
import { JOB_STATUS } from "@/lib/constants";

// Definizione del tipo complesso recuperato da Prisma
type JobWithItems = Awaited<ReturnType<typeof prisma.job.findMany>>[number];

export async function getAccountingData() {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const completedJobs = await prisma.job.findMany({
      where: {
        status: { in: [JOB_STATUS.COMPLETED, JOB_STATUS.DELIVERED] },
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            part: true
          }
        }
      }
    });

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalLabor = 0;

    const monthlyStats = Array(12).fill(0).map((_, i) => ({
      name: new Date(2024, i, 1).toLocaleString('it-IT', { month: 'short' }),
      fatturato: 0,
      utile: 0
    }));

    // [!code warning] Ora usiamo il tipo corretto invece di 'any'
    completedJobs.forEach((job: JobWithItems) => {
      const jobRevenue = job.totalCost;
      totalRevenue += jobRevenue;
      totalLabor += job.laborCost;

      // [!code warning] 'item' viene inferito automaticamente grazie a JobWithItems
      const jobPartsCostBuy = job.items.reduce((acc: number, item: typeof job.items[number]) => {
        return acc + (item.part.buyPrice * item.quantity);
      }, 0);
      
      totalExpenses += jobPartsCostBuy;

      const month = new Date(job.startDate).getMonth();
      monthlyStats[month].fatturato += jobRevenue;
      monthlyStats[month].utile += (jobRevenue - jobPartsCostBuy);
    });

    const netMargin = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        kpi: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          margin: netMargin,
          labor: totalLabor,
          jobsCount: completedJobs.length
        },
        chartData: monthlyStats
      }
    };

  } catch (error) {
    console.error("Errore contabilità:", error);
    return { success: false, error: "Errore calcolo dati" };
  }
}