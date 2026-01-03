"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { X, Save, ArrowRightLeft, AlertCircle } from "lucide-react";
import { updateStock } from "@/app/actions/inventory";
import { useRouter } from "next/navigation";

interface PartBasic {
  id: string;
  name: string;
  stock: number;
  code: string;
}

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: PartBasic | null;
}

interface MovementFormData {
  quantity: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  reason: string;
}

export default function StockMovementModal({ isOpen, onClose, part }: StockMovementModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // FIX: Usiamo useState per gestire l'errore visivamente invece dell'alert
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MovementFormData>({
    defaultValues: {
      quantity: 1,
      type: "IN",
      reason: ""
    }
  });

  if (!isOpen || !part) return null;

  const onSubmit = (data: MovementFormData) => {
    setServerError(null); // Resetta errori precedenti
    startTransition(async () => {
      const formData = new FormData();
      formData.append("partId", part.id);
      
      let finalQuantity = data.quantity;
      if (data.type === "OUT") {
        finalQuantity = -Math.abs(data.quantity);
      }

      formData.append("quantity", finalQuantity.toString());
      formData.append("type", data.type);
      formData.append("reason", data.reason);

      const res = await updateStock(formData, "SYSTEM_USER");

      if (res && res.success) {
        reset();
        onClose();
        router.refresh();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMsg = (res as any)?.error || (res as any)?.message || "Errore durante il movimento";
        const displayMsg = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg;
        
        // FIX: Salviamo l'errore nello stato
        setServerError(displayMsg);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-white font-bold flex items-center gap-2">
            <ArrowRightLeft className="text-primary" size={20} />
            Movimento Magazzino
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* FIX: Mostriamo l'errore server se presente */}
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {serverError}
            </div>
          )}

          <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 mb-4">
            <p className="text-xs text-gray-400">Articolo</p>
            <p className="text-white font-bold">{part.name}</p>
            <p className="text-xs text-gray-500">{part.code} • Attuali: {part.stock} pz</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo Movimento</label>
            <select 
              {...register("type")}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
            >
              <option value="IN">Carico (+)</option>
              <option value="OUT">Scarico (-)</option>
              <option value="ADJUSTMENT">Rettifica / Inventario</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Quantità</label>
            <input 
              type="number" 
              step="1"
              min="1"
              {...register("quantity", { valueAsNumber: true, min: { value: 1, message: "Minimo 1" } })}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
            />
            {/* FIX: Mostriamo errori di validazione del campo */}
            {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Causale / Note</label>
            <input 
              {...register("reason")}
              placeholder="Es. Acquisto fornitore, Rottura, etc."
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-orange-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isPending ? "Salvataggio..." : <><Save size={18} /> Registra Movimento</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}