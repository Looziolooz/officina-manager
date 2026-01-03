"use client";

import { useEffect, useState } from "react";
import { decrementPartStockAction, getQuickPartsStock } from "@/app/actions/inventory";
import { Zap, Droplet, Disc, Filter, Minus, RefreshCw } from "lucide-react";

interface PartStock {
  id: string;
  name: string;
  code: string;
  category: string;
  stock: number;
  minStock: number;
}

export default function QuickInventory() {
  const [stocks, setStocks] = useState<PartStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Funzione per il pulsante di aggiornamento manuale
  const refreshStock = async () => {
    try {
      const result = await getQuickPartsStock();
      if (result.success && Array.isArray(result.data)) {
        setStocks(result.data as PartStock[]);
      }
    } catch (error) {
      console.error("Errore aggiornamento stock:", error);
    }
  };

  // 2. Effetto isolato per il caricamento iniziale (Mount)
  // Definiamo la funzione QUI DENTRO per non avere dipendenze esterne
  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      try {
        const result = await getQuickPartsStock();
        if (isMounted && result.success && Array.isArray(result.data)) {
          setStocks(result.data as PartStock[]);
        }
      } catch (error) {
        console.error("Errore inizializzazione stock:", error);
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []); // Dipendenze vuote: corre solo una volta al montaggio

  const handleQuickUse = async (id: string) => {
    if (isLoading) return;
    setIsLoading(true);
    
    // Optimistic UI update
    setStocks(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - 1) } : p));
    
    await decrementPartStockAction(id);
    
    setIsLoading(false);
  };

  const getIcon = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("olio")) return <Droplet className="text-amber-500" size={18} />;
    if (cat.includes("freni") || cat.includes("dischi")) return <Disc className="text-slate-400" size={18} />;
    if (cat.includes("filtri")) return <Filter className="text-blue-400" size={18} />;
    return <Zap className="text-primary" size={18} />;
  };

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          Magazzino Rapido
        </h3>
        <button 
          onClick={refreshStock} 
          className="text-gray-400 hover:text-white transition-colors"
          title="Aggiorna"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {stocks.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg">
                {getIcon(item.category)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{item.name}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{item.code}</span>
                  {item.stock <= item.minStock && (
                    <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">Low</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className={`text-lg font-mono font-bold ${item.stock <= item.minStock ? 'text-red-400' : 'text-white'}`}>
                  {item.stock}
                </span>
                <span className="text-xs text-gray-500 block">pz.</span>
              </div>
              
              <button
                onClick={() => handleQuickUse(item.id)}
                disabled={isLoading || item.stock <= 0}
                className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Scarica 1 pz"
              >
                <Minus size={16} />
              </button>
            </div>
          </div>
        ))}

        {stocks.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Nessun ricambio rapido trovato.
          </div>
        )}
      </div>
    </div>
  );
}