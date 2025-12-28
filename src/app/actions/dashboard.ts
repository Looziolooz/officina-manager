"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const now = new Date();
    // Inizio e fine mese corrente per i KPI
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. FATTURATO E MARGINE MESE CORRENTE (Dalla tabella Contabilità)
    const accountingAgg = await prisma.accountingRecord.aggregate({
      where: {
        type: "ENTRATA",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: { 
        amount: true,
        margin: true 
      }
    });

    // 2. AUTO ATTUALMENTE IN OFFICINA (Esclusi ARCHIVIATI e SCHEDULATI)
    const carsInWorkshop = await prisma.job.count({
      where: {
        status: { in: ["IN_LAVORAZIONE", "ATTESA_RICAMBI"] }
      }
    });

    // 3. SCORTE SOTTO SOGLIA (Magazzino)
    // Recuperiamo i pezzi dove lo stock è minore o uguale alla soglia minima impostata
    const parts = await prisma.part.findMany({
      select: { stockQuantity: true, minThreshold: true }
    });
    const lowStockParts = parts.filter(p => p.stockQuantity <= p.minThreshold).length;

    // 4. VALORE TOTALE MAGAZZINO (Asset corrente)
    const allParts = await prisma.part.findMany({
      select: { stockQuantity: true, sellPrice: true }
    });
    const inventoryValue = allParts.reduce((acc, p) => acc + (p.stockQuantity * p.sellPrice), 0);

    // 5. DATI GRAFICO (Ultimi 7 giorni: Fatturato vs Margine)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const dayStats = await prisma.accountingRecord.aggregate({
        where: {
          type: "ENTRATA",
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        _sum: { amount: true, margin: true }
      });

      const dayName = startOfDay.toLocaleDateString('it-IT', { weekday: 'short' });
      
      chartData.push({
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        fatturato: dayStats._sum.amount || 0,
        margine: dayStats._sum.margin || 0
      });
    }

    // 6. TOP 5 PRODOTTI PIÙ VENDUTI (Dall'archiviazione lavori)
    const topParts = await prisma.jobItem.groupBy({
      by: ['description'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    return {
      success: true,
      data: {
        monthlyRevenue: accountingAgg._sum.amount || 0,
        monthlyMargin: accountingAgg._sum.margin || 0,
        carsInWorkshop,
        lowStockParts,
        inventoryValue,
        chartData,
        topParts: topParts.map(p => ({
          name: p.description,
          qty: p._sum.quantity
        }))
      }
    };

  } catch (error) {
    console.error("Errore Dashboard Avanzata:", error);
    return { success: false, error: "Impossibile recuperare statistiche" };
  }
}