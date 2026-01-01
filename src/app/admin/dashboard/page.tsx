import { getDashboardData } from "@/app/actions/dashboard";
import { KPICard } from "@/components/dashboard/KPICard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RevenueDistributionChart } from "@/components/dashboard/RevenueDistributionChart";
import { TopPartsWidget, TopCustomersWidget } from "@/components/dashboard/TopWidgets";
import { DollarSign, TrendingUp, Car, Package } from "lucide-react";

export default async function AdminDashboard() {
  const data = await getDashboardData();
  const { kpis, chartData, topParts, topCustomers } = data;

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400">Panoramica officina in tempo reale</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Fatturato Oggi"
          value={`€${kpis.todayRevenue.toLocaleString()}`}
          change={kpis.revenueChange}
          trend={kpis.revenueChange >= 0 ? "up" : "down"}
          icon={<DollarSign size={24} />}
          color="orange"
          sparklineData={kpis.last7DaysRevenue}
        />
        <KPICard
          title="Margine Netto"
          value={`€${kpis.todayMargin.toLocaleString()}`}
          change={kpis.marginChange}
          trend={kpis.marginChange >= 0 ? "up" : "down"}
          icon={<TrendingUp size={24} />}
          color="green"
          sparklineData={kpis.last7DaysMargin}
        />
        <KPICard
          title="Auto in Officina"
          value={kpis.carsInWorkshop}
          change={kpis.carsChange}
          trend={kpis.carsChange >= 0 ? "up" : "down"}
          icon={<Car size={24} />}
          color="blue"
        />
        <KPICard
          title="Valore Magazzino"
          value={`€${kpis.warehouseValue.toLocaleString()}`}
          change={kpis.warehouseChange}
          trend={kpis.warehouseChange >= 0 ? "up" : "down"}
          icon={<Package size={24} />}
          color="purple"
          sparklineData={kpis.last7DaysWarehouse}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={chartData} />
        {/* Mock labor/parts split per demo */}
        <RevenueDistributionChart laborRevenue={kpis.todayRevenue * 0.6} partsRevenue={kpis.todayRevenue * 0.4} />
      </div>

      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPartsWidget parts={topParts} />
        <TopCustomersWidget customers={topCustomers} />
      </div>
    </div>
  );
}