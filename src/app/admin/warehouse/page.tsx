import { prisma } from "@/lib/db";
import PartCard from "@/components/warehouse/PartCard";
import NewPartModal from "@/components/warehouse/NewPartModal"; 
import { Package, AlertCircle, TrendingUp } from "lucide-react";

// Nota: Sostituisci con l'ID reale della sessione utente in produzione
const CURRENT_USER_ID = "user_demo_id"; 

export default async function WarehousePage() {
  const [parts, alerts] = await Promise.all([
    prisma.part.findMany({
      orderBy: { stockLevel: 'asc' }, 
    }),
    prisma.stockAlert.findMany({
      where: { isRead: false },
      include: { part: true },
      take: 5
    })
  ]);

  const totalValue = parts.reduce((acc: number, p) => acc + p.totalValue, 0);
  const criticalCount = parts.filter(p => p.stockLevel === 'CRITICAL').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* --- HEADER PRINCIPALE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter uppercase flex items-center gap-3">
            <Package className="text-orange-500" /> Magazzino
          </h1>
          <p className="text-gray-400 text-sm">Gestione scorte e inventario</p>
        </div>
        {/* BOTTONE NUOVO PRODOTTO */}
        <NewPartModal />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <Package size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm uppercase font-bold">Totale Referenze</p>
              <h2 className="text-3xl font-bold text-white">{parts.length}</h2>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm uppercase font-bold">Valore Magazzino</p>
              <h2 className="text-3xl font-bold text-white font-mono">
                € {totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm uppercase font-bold">Scorte Critiche</p>
              <h2 className="text-3xl font-bold text-white">{criticalCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      {alerts.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
          <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <AlertCircle size={18} /> Alert Attivi
          </h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <span className="text-white text-sm">
                  <strong>{alert.part.code}</strong>: {alert.message}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Ricambi */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Inventario</h2>
        {parts.length === 0 ? (
          <div className="text-center py-20 text-slate-500 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center gap-4">
            <Package size={48} className="opacity-20" />
            <p>Il magazzino è vuoto.</p>
            {/* FIX: Usato &quot; invece delle virgolette dirette */}
            <p className="text-sm">Clicca &quot;Nuovo Prodotto&quot; in alto a destra per iniziare.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parts.map((part) => (
              <PartCard key={part.id} part={part} userId={CURRENT_USER_ID} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}