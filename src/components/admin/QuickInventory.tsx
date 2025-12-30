"use client";
import { useEffect, useState } from "react";
import { decrementPartStockAction, getQuickPartsStock } from "@/app/actions/inventory";
import { Zap, Droplet, Disc, Filter } from "lucide-react";

interface PartStock {
  id: string;
  code: string;
  stock: number;
}

export default function QuickInventory({ jobId }: { jobId: string }) {
  const [stocks, setStocks] = useState<PartStock[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchStock = async () => {
    const data = await getQuickPartsStock();
    setStocks(data);
  };

  useEffect(() => {
    fetchStock();
    // Refresh automatico ogni 30 secondi per Giovanni
    const interval = setInterval(fetchStock, 30000);
    return () => clearInterval(interval);
  }, []);

const handleQuickAdd = async (partId: string) => {
    setLoading(partId);
    try {
      await decrementPartStockAction(jobId, partId, 1);
      await fetchStock();
    } catch (err) {
      // Risolto: err ora è utilizzato per il log di sistema
      console.error("Errore durante lo scarico ricambio:", err);
      alert("Errore: Scorte esaurite o problema di connessione.");
    } finally {
      setLoading(null);
    }
  };

  const quickParts = [
    { code: "oil-id", name: "Olio", icon: <Droplet size={14} className="text-orange-500" /> },
    { code: "filter-id", name: "Filtro", icon: <Filter size={14} className="text-blue-500" /> },
    { code: "pads-id", name: "Freni", icon: <Disc size={14} className="text-red-500" /> },
  ];

  return (
    <div className="p-3 bg-black/20 rounded-xl border border-white/5">
      <h4 className="text-[9px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-1 italic">
        <Zap size={10} className="text-yellow-500" /> Scarico Rapido Magazzino
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {quickParts.map((item) => {
          const currentPart = stocks.find(s => s.code === item.code);
          const isLow = currentPart ? currentPart.stock < 5 : false;

          return (
            <button
              key={item.code}
              disabled={loading !== null || !currentPart || currentPart.stock === 0}
              onClick={() => currentPart && handleQuickAdd(currentPart.id)}
              className="relative flex flex-col items-center p-2 rounded-lg bg-slate-900 border border-white/10 hover:border-primary/50 transition-all disabled:opacity-30 group"
            >
              {/* BADGE NUMERICO IN TEMPO REALE */}
              {currentPart !== undefined && (
                <span className={`absolute -top-1 -right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${
                  isLow ? "bg-red-600 border-red-400 text-white" : "bg-green-600 border-green-400 text-white"
                }`}>
                  {currentPart.stock}
                </span>
              )}
              
              {item.icon}
              <span className="text-[8px] text-gray-400 mt-1 font-bold">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}