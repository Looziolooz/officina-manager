import { prisma } from "@/lib/db";
import PartCard from "@/components/warehouse/PartCard";
import NewPartModal from "@/components/warehouse/NewPartModal";
import { Package, Search, Filter, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic"; // Assicura che i dati siano sempre freschi

export default async function WarehousePage() {
  // 1. Recupera i ricambi dal DB
  const parts = await prisma.part.findMany({
    orderBy: { updatedAt: "desc" },
  });

  // 2. Calcola KPI rapidi
  const lowStockCount = parts.filter((p) => p.stock <= p.minStock).length;
  const totalValue = parts.reduce((acc, p) => acc + (p.stock * p.buyPrice), 0);

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">Magazzino</h1>
          <p className="text-gray-400 text-sm">Gestione ricambi, giacenze e ordini</p>
        </div>
        
        {/* FIX: NewPartModal è ora autonomo e include il suo bottone */}
        <NewPartModal />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Totale Articoli</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Package size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{parts.length}</p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Valore Totale</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <span className="font-bold text-lg">€</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(totalValue)}
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Sotto Scorta</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* FILTRI (UI Placeholder per ora) */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cerca per codice, nome o marca..." 
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-colors"
          />
        </div>
        <button className="bg-slate-900 border border-white/10 hover:border-primary text-gray-300 px-4 rounded-xl flex items-center gap-2 transition-colors">
          <Filter size={20} />
          <span className="hidden md:inline">Filtri</span>
        </button>
      </div>

      {/* GRID DEI PRODOTTI */}
      {parts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Magazzino Vuoto</h3>
          <p className="text-gray-400">Inizia aggiungendo il primo ricambio al sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parts.map((part) => (
            // FIX: Rimosso userId che non è più richiesto dal componente
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  );
}