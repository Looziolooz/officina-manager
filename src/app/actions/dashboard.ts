"use server";

import { prisma } from "@/lib/db";
import { startOfDay, subDays, endOfDay, startOfMonth } from "date-fns";

export async function getDashboardData() {
  const [kpis, chartData, topParts, topCustomers, quickStats] = await Promise.all([
    getDashboardKPIs(),
    getLast7DaysPerformance(),
    getTopParts(5),
    getTopCustomers(5),
    getQuickStats(),
  ]);

  return {
    kpis,
    chartData,
    topParts,
    topCustomers,
    quickStats,
  };
}

// 1. KPI Principali
async function getDashboardKPIs() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const [todayData, yesterdayData, last7DaysData, warehouseData, carsData] = await Promise.all([
    prisma.accountingRecord.aggregate({
      where: { type: "INCOME", date: { gte: today } },
      _sum: { totalAmount: true, amount: true },
    }),
    prisma.accountingRecord.aggregate({
      where: { type: "INCOME", date: { gte: yesterday, lt: today } },
      _sum: { totalAmount: true },
    }),
    prisma.accountingRecord.groupBy({
      by: ["date"],
      where: { type: "INCOME", date: { gte: last7Days } },
      _sum: { totalAmount: true, amount: true },
      orderBy: { date: "asc" },
    }),
    prisma.part.aggregate({ _sum: { totalValue: true } }),
    prisma.job.count({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS", "WAITING_PARTS"] } },
    }),
  ]);

  const todayRevenue = todayData._sum.totalAmount || 0;
  const yesterdayRevenue = yesterdayData._sum.totalAmount || 0;
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  const todayMargin = todayRevenue - (todayData._sum.amount || 0);

  return {
    todayRevenue,
    revenueChange: Math.round(revenueChange),
    todayMargin,
    marginChange: 5,
    carsInWorkshop: carsData,
    carsChange: -1,
    warehouseValue: warehouseData._sum.totalValue || 0,
    warehouseChange: 2,
    last7DaysRevenue: last7DaysData.map((d) => d._sum.totalAmount || 0),
    last7DaysMargin: last7DaysData.map((d) => (d._sum.totalAmount || 0) - (d._sum.amount || 0)),
    last7DaysWarehouse: [12200, 12300, 12400, 12350, 12450, 12480, 12450], 
  };
}

// 2. Grafico Performance 7gg
async function getLast7DaysPerformance() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    days.push({ start: startOfDay(date), end: endOfDay(date), date });
  }

  return await Promise.all(
    days.map(async ({ start, end, date }) => {
      const [revenue, expenses] = await Promise.all([
        prisma.accountingRecord.aggregate({
          where: { type: "INCOME", date: { gte: start, lte: end } },
          _sum: { totalAmount: true },
        }),
        prisma.accountingRecord.aggregate({
          where: { type: "EXPENSE", date: { gte: start, lte: end } },
          _sum: { totalAmount: true },
        }),
      ]);

      const totalRevenue = revenue._sum.totalAmount || 0;
      const totalExpenses = expenses._sum.totalAmount || 0;

      return {
        date,
        revenue: totalRevenue,
        margin: totalRevenue - totalExpenses,
      };
    })
  );
}

// 3. Top Ricambi
async function getTopParts(limit = 5) {
  const last30Days = subDays(new Date(), 30);
  const topParts = await prisma.partOnJob.groupBy({
    by: ["partId"],
    where: { createdAt: { gte: last30Days } },
    _sum: { quantity: true, appliedPrice: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  return await Promise.all(
    topParts.map(async (item) => {
      const part = await prisma.part.findUnique({ where: { id: item.partId } });
      const revenue = (item._sum.appliedPrice || 0) * (item._sum.quantity || 0);
      const cost = (part?.buyPrice || 0) * (item._sum.quantity || 0);
      return {
        id: item.partId,
        code: part?.code || "N/A",
        name: part?.name || "Sconosciuto",
        category: part?.category || "Generico",
        quantitySold: item._sum.quantity || 0,
        revenue,
        margin: revenue - cost,
      };
    })
  );
}

// 4. Top Clienti
async function getTopCustomers(limit = 5) {
  const topCustomers = await prisma.invoice.groupBy({
    by: ["customerId"],
    _sum: { total: true },
    _count: { id: true },
    orderBy: { _sum: { total: "desc" } },
    take: limit,
  });

  return await Promise.all(
    topCustomers.map(async (item) => {
      const customer = await prisma.customer.findUnique({ where: { id: item.customerId } });
      return {
        id: item.customerId,
        name: customer?.companyName || `${customer?.firstName} ${customer?.lastName}`,
        totalSpent: item._sum.total || 0,
        invoiceCount: item._count.id,
        lastVisit: customer?.lastVisit || new Date(),
      };
    })
  );
}

// 5. Quick Stats
async function getQuickStats() {
  const thisMonth = startOfMonth(new Date());
  const [invoicesCount, lowStock, avgJobValue] = await Promise.all([
    prisma.invoice.count({ where: { issueDate: { gte: thisMonth }, status: { not: "CANCELLED" } } }),
    prisma.part.count({ where: { stockLevel: { in: ["LOW", "CRITICAL"] } } }),
    prisma.job.aggregate({
      where: { completedAt: { gte: subDays(new Date(), 30) } },
      _avg: { totalAmount: true },
    }),
  ]);

  return {
    invoicesIssued: invoicesCount,
    lowStockParts: lowStock,
    averageJobValue: Math.round(avgJobValue._avg.totalAmount || 0),
  };
}