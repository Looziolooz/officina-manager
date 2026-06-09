import { prisma } from "@/lib/db";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const selectedMonth = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const selectedYear = params.year ? parseInt(params.year) : now.getFullYear();

  const startDate = startOfMonth(new Date(selectedYear, selectedMonth - 1));
  const endDate = endOfMonth(new Date(selectedYear, selectedMonth - 1));

  const totalJobs = await prisma.job.count({ where: { createdAt: { gte: startDate, lte: endDate } } });
  const completedJobs = await prisma.job.count({ where: { status: "COMPLETED", completedAt: { gte: startDate, lte: endDate } } });
  const totalRevenue = await prisma.invoice.aggregate({
    where: { issueDate: { gte: startDate, lte: endDate }, status: { in: ["PAID", "PARTIALLY_PAID"] } },
    _sum: { total: true },
  });
  const totalExpenses = await prisma.expense.aggregate({
    where: { expenseDate: { gte: startDate, lte: endDate } },
    _sum: { totalAmount: true },
  });
  const jobsByStatus = await prisma.job.groupBy({
    by: ["status"],
    where: { createdAt: { gte: startDate, lte: endDate } },
    _count: { status: true },
  });

  const revenueByMonth = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      return prisma.invoice.aggregate({
        where: { issueDate: { gte: monthStart, lte: monthEnd }, status: { in: ["PAID", "PARTIALLY_PAID"] } },
        _sum: { total: true },
      }).then((result) => ({
        month: format(date, "MMM yyyy", { locale: it }),
        revenue: result._sum.total || 0,
      }));
    })
  );

  const topCustomers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true, invoices: { where: { status: "PAID" }, select: { total: true } } },
    orderBy: { id: "desc" },
    take: 10,
  });

  const topPartsRaw = await prisma.partOnJob.groupBy({
    by: ["partId"],
    where: { job: { status: "COMPLETED", completedAt: { gte: startDate, lte: endDate } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });
  const topParts = await Promise.all(
    topPartsRaw.map(async (r) => {
      const part = await prisma.part.findUnique({ where: { id: r.partId }, select: { name: true, code: true } });
      return { part, quantity: r._sum.quantity || 0 };
    })
  );

  const profit = (totalRevenue._sum.total || 0) - (totalExpenses._sum.totalAmount || 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reportistica</h1>
        <Link href="/admin/reports/export" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
          Esporta Dati
        </Link>
      </div>

      {/* Period Selector */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form method="get" className="flex gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Mese</label>
            <select name="month" defaultValue={selectedMonth} className="border rounded px-3 py-2">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>{format(new Date(2024, i), "MMMM", { locale: it })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Anno</label>
            <select name="year" defaultValue={selectedYear} className="border rounded px-3 py-2">
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Aggiorna
          </button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Lavori Totali</h3>
          <p className="text-2xl font-bold">{totalJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Lavori Completati</h3>
          <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Ricavi</h3>
          <p className="text-2xl font-bold text-blue-600">€ {(totalRevenue._sum.total || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Utile</h3>
          <p className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
            € {profit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Jobs by Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Lavori per Stato</h3>
          <div className="space-y-2">
            {jobsByStatus.map((item) => (
              <div key={item.status} className="flex justify-between">
                <span className="text-sm">{item.status}</span>
                <span className="font-medium">{item._count.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Top Clienti (per ricavo)</h3>
          <div className="space-y-2">
            {topCustomers.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{i + 1}.</span>
                  <span className="text-sm">{c.firstName} {c.lastName}</span>
                </div>
                <span className="text-sm font-medium">€ {((c.invoices as any)?._sum?.total || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Month */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-3">Ricavi Ultimi 6 Mesi</h3>
        <div className="space-y-2">
          {revenueByMonth.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm w-24">{item.month}</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{
                    width: `${Math.max(5, (item.revenue / Math.max(1, revenueByMonth[revenueByMonth.length - 1]?.revenue || 1)) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium w-24 text-right">€ {item.revenue.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Parts */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3">Ricambi Più Venduti</h3>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left text-xs text-gray-500">Codice</th>
              <th className="text-left text-xs text-gray-500">Nome</th>
              <th className="text-left text-xs text-gray-500">Quantità</th>
            </tr>
          </thead>
          <tbody>
            {topParts.map((item, i) => (
              <tr key={i}>
                <td className="py-2 text-sm">{item.part?.code}</td>
                <td className="py-2 text-sm">{item.part?.name}</td>
                <td className="py-2 text-sm font-medium">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
