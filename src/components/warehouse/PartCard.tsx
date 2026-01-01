"use client";

import { Part } from "@prisma/client";
import { Package, TrendingUp, AlertTriangle, AlertOctagon } from "lucide-react";
import StockMovementModal from "./StockMovementModal"; // Lo creiamo dopo

interface Props {
  part: Part;
  userId: string; // ID utente per le azioni
}

export default function PartCard({ part, userId }: Props) {
  // Calcolo % per la progress bar
  const maxRef = part.maxStock || part.minStock * 3;
  const progressPercent = Math.min((part.stock / maxRef) * 100, 100);

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500', bar: 'bg-red-500' };
      case 'LOW': return { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500', bar: 'bg-yellow-500' };
      case 'HIGH': return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500', bar: 'bg-blue-500' };
      default: return { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-500', bar: 'bg-green-500' };
    }
  };

  const colors = getStatusColor(part.stockLevel);

  return (
    <div className={`bg-slate-900 border ${colors.border}/30 rounded-2xl p-5 hover:border-${colors.text.split('-')[1]}-400 transition-all shadow-lg group`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg}/10 flex items-center justify-center ${colors.text}`}>
             <Package size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{part.name}</h3>
            <span className="text-xs font-mono text-slate-400">{part.code}</span>
          </div>
        </div>
        {part.stockLevel === 'CRITICAL' && <AlertOctagon className="text-red-500 animate-pulse" size={20} />}
        {part.stockLevel === 'LOW' && <AlertTriangle className="text-yellow-500" size={20} />}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="bg-white/5 p-2 rounded-lg">
          <span className="text-xs text-slate-500 block uppercase">Ubicazione</span>
          <span className="font-mono text-white font-bold">{part.location || "N/A"}</span>
        </div>
        <div className="bg-white/5 p-2 rounded-lg text-right">
          <span className="text-xs text-slate-500 block uppercase">Prezzo Vendita</span>
          <span className="font-mono text-emerald-400 font-bold">€{part.sellPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Stock Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Stock: <strong className="text-white">{part.stock}</strong></span>
          <span className="text-slate-500">Min: {part.minStock}</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.bar} transition-all duration-500`} 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <StockMovementModal part={part} type="IN" userId={userId} />
        <StockMovementModal part={part} type="OUT" userId={userId} />
      </div>
    </div>
  );
}