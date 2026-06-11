import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { AttentionStrip } from "@/components/dashboard/AttentionStrip";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RevenueDistributionChart } from "@/components/dashboard/RevenueDistributionChart";
import { TopPartsWidget, TopCustomersWidget } from "@/components/dashboard/TopWidgets";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Car, Package, AlertCircle } from "lucide-react";

// La dashboard legge la sessione (cookie/headers): è sempre dinamica.
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Caricamento robusto: se il database non risponde, mostriamo un messaggio
  // chiaro invece della schermata tecnica di errore (importante per non esperti).
  let data: Awaited<ReturnType<typeof getDashboardData>>;
  try {
    data = await getDashboardData();
  } catch (error) {
    console.error("[dashboard] caricamento dati fallito:", error);
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md text-center rounded-2xl bg-surface border border-border p-10">
          <div className="inline-flex p-3 rounded-xl bg-red-500/10 text-red-400 mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            Impossibile caricare i dati
          </h2>
          <p className="text-sm text-muted-foreground">
            Si è verificato un problema nel recupero dei dati della dashboard.
            Ricarica la pagina tra qualche istante. Se il problema persiste,
            contatta l&apos;assistenza.
          </p>
        </div>
      </div>
    );
  }

  const { kpis, chartData, topParts, topCustomers, quickStats, revenueSplit } = data;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica officina in tempo reale</p>
      </div>

      {/* Da tenere d'occhio — informazioni azionabili in primo piano */}
      <AttentionStrip
        lowStockParts={quickStats.lowStockParts}
        invoicesIssued={quickStats.invoicesIssued}
        averageJobValue={quickStats.averageJobValue}
      />

      {/* KPI principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardKpiCard
          label="Fatturato Oggi"
          value={formatCurrency(kpis.todayRevenue)}
          delta={kpis.revenueChange !== 0 ? { value: kpis.revenueChange, label: "vs ieri" } : undefined}
          icon={<DollarSign size={18} />}
          hint="Incassi totali registrati oggi."
        />
        <DashboardKpiCard
          label="Margine Netto"
          value={formatCurrency(kpis.todayMargin)}
          delta={kpis.marginChange !== 0 ? { value: kpis.marginChange, label: "vs ieri" } : undefined}
          icon={<TrendingUp size={18} />}
          hint="Quanto resta dopo i costi: incassi meno spese di oggi."
        />
        <DashboardKpiCard
          label="Auto in Officina"
          value={kpis.carsInWorkshop}
          icon={<Car size={18} />}
          hint="Veicoli attualmente pianificati, in lavorazione o in attesa ricambi."
        />
        <DashboardKpiCard
          label="Valore Magazzino"
          value={formatCurrency(kpis.warehouseValue)}
          icon={<Package size={18} />}
          hint="Valore totale dei ricambi attualmente in magazzino."
        />
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={chartData} />
        <RevenueDistributionChart laborRevenue={revenueSplit.labor} partsRevenue={revenueSplit.parts} />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPartsWidget parts={topParts} />
        <TopCustomersWidget customers={topCustomers} />
      </div>
    </div>
  );
}
