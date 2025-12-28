import { getDashboardStats } from "@/app/actions/dashboard";
import DashboardCharts from "./DashboardCharts";
import { TrendingUp, Wallet, Package, Car } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats.success || !stats.data) {
    return (
      <div className="p-8 text-white">
        <p>Errore nel caricamento dei dati: {stats.error}</p>
      </div>
    );
  }

  const { data } = stats;

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen">
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Dashboard Analitica</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] italic tracking-widest">Dati integrati Officina & Contabilità</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardKpi 
          title="Fatturato Mese" 
          value={`€ ${data.monthlyRevenue.toFixed(2)}`} 
          icon={<Wallet className="text-blue-500" />} 
        />
        <CardKpi 
          title="Margine Mese" 
          value={`€ ${data.monthlyMargin.toFixed(2)}`} 
          icon={<TrendingUp className="text-green-500" />} 
        />
        <CardKpi 
          title="Valore Magazzino" 
          value={`€ ${data.inventoryValue.toFixed(2)}`} 
          icon={<Package className="text-orange-500" />} 
        />
        <CardKpi 
          title="Auto in Officina" 
          value={`${data.carsInWorkshop}`} 
          icon={<Car className="text-purple-500" />} 
        />
      </div>

      {/* Sezione Grafici */}
      <DashboardCharts data={data} />
    </div>
  );
}

function CardKpi({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-black rounded-2xl border border-slate-800">{icon}</div>
        {/* Badge Sotto Soglia per Magazzino se necessario */}
        {title === "Valore Magazzino" && (
          <div className="bg-orange-500/10 text-orange-500 text-[8px] font-black px-2 py-1 rounded uppercase">
            Asset Corrente
          </div>
        )}
      </div>
      <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">{title}</p>
      <p className="text-2xl font-black text-white tracking-tighter mt-1">{value}</p>
    </div>
  );
}