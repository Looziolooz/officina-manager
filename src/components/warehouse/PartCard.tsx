"use client";

import { useState } from "react";
import { Package, MapPin, ArrowRightLeft } from "lucide-react";
import { Part } from "@prisma/client";
import StockMovementModal from "./StockMovementModal";

interface PartCardProps {
  part: Part;
}

export default function PartCard({ part }: PartCardProps) {
  // Gestiamo lo stato di apertura del modale qui dentro la card
  const [isMovementModalOpen, setMovementModalOpen] = useState(false);

  // Helper per formattare valuta
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const isLowStock = part.stock <= part.minStock;

  return (
    <>
      <div className={`bg-slate-900/50 border ${isLowStock ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-6 hover:bg-slate-900/80 transition-all group relative overflow-hidden flex flex-col h-full`}>
        {/* Indicatore Low Stock */}
        {isLowStock && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
            SCORTA BASSA
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-primary shrink-0">
            <Package size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight line-clamp-1" title={part.name}>
                {part.name}
            </h3>
            <p className="text-gray-400 text-sm font-mono mt-1">{part.code}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                    {part.category}
                </span>
                {part.brand && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                        {part.brand}
                    </span>
                )}
            </div>
          </div>
        </div>

        {/* Info Grid - Spinge il footer in basso grazie a flex-col e margin auto */}
        <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
            <p className="text-gray-500 text-xs mb-1">Giacenza</p>
            <p className={`text-xl font-mono font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
              {part.stock} <span className="text-xs font-normal text-gray-500">pz</span>
            </p>
          </div>
          <div className="bg-black/20 p-3 rounded-lg border border-white/5">
            <p className="text-gray-500 text-xs mb-1">Vendita</p>
            <p className="text-xl font-mono font-bold text-white">
              {formatCurrency(part.sellPrice)}
            </p>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <MapPin size={14} />
            {part.location || "N/D"}
          </div>

          <button
            onClick={() => setMovementModalOpen(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-primary hover:text-white text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowRightLeft size={16} />
            Movimenta
          </button>
        </div>
      </div>

      {/* FIX: Collegamento corretto al modale con le props aggiornate */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        part={part}
      />
    </>
  );
}