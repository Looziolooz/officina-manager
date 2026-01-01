"use client";

import { useState } from "react";
import { Part, MovementType } from "@prisma/client";
import { createStockMovement } from "@/app/actions/warehouse";
import { Plus, Minus, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  part: Part;
  type: 'IN' | 'OUT';
  userId: string;
}

export default function StockMovementModal({ part, type, userId }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    // @ts-ignore - Ignoriamo temporaneamente errori di tipo stretto su prisma client non generato
    const res = await createStockMovement({
      partId: part.id,
      type: type as MovementType,
      quantity: qty,
      reason,
      notes,
      performedById: userId
    });

    setIsLoading(false);
    if (res.success) {
      setIsOpen(false);
      setQty(1);
      setReason("");
      setNotes("");
      router.refresh();
    } else {
      alert("Errore: " + res.error);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          type === 'IN' 
            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
            : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
        }`}
      >
        {type === 'IN' ? <Plus size={16} /> : <Minus size={16} />}
        {type === 'IN' ? 'Carico' : 'Scarico'}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-1">
          {type === 'IN' ? 'Carico Merce' : 'Scarico Merce'}
        </h3>
        <p className="text-slate-400 text-sm mb-6">{part.code} • {part.name}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Quantità</label>
            <input 
              type="number" 
              min="1" 
              value={qty} 
              onChange={(e) => setQty(parseInt(e.target.value))}
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-lg font-mono" 
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Motivazione</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"
            >
              <option value="">-- Seleziona --</option>
              {type === 'IN' ? (
                <>
                  <option value="ACQUISTO">Acquisto Fornitore</option>
                  <option value="RESO_CLIENTE">Reso da Cliente</option>
                  <option value="RETTIFICA">Rettifica Inventario (+)</option>
                </>
              ) : (
                 <>
                  <option value="VENDITA">Vendita al Banco</option>
                  <option value="LAVORO">Utilizzo in Lavoro</option>
                  <option value="SCARTO">Danneggiato / Scaduto</option>
                  <option value="RETTIFICA">Rettifica Inventario (-)</option>
                </>
              )}
            </select>
          </div>
          
          <div>
             <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Note</label>
             <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white h-20"
                placeholder="Dettagli opzionali..."
             />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all"
          >
            Annulla
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || qty <= 0}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
               type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}