"use client";

import { useState, useTransition } from "react";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, AlertCircle, Plus } from "lucide-react";
import { createPart } from "@/app/actions/inventory";
import { partSchema, type PartFormData } from "@/lib/schemas";

// FIX: Rimosse le props esterne, il componente ora è autonomo
export default function NewPartModal() {
  // FIX: Gestione stato interna
  const [isOpen, setIsOpen] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "",
      brand: "",
      location: "",
      buyPrice: 0,
      markup: 30,
      sellPrice: 0,
      stock: 0,
      minStock: 2,
      maxStock: 10,
    },
  });

  const buyPrice = useWatch({ control, name: "buyPrice" });
  const markup = useWatch({ control, name: "markup" });

  const onSubmit: SubmitHandler<PartFormData> = (data) => {
    setServerError(null);
    startTransition(async () => {
      const safeBuyPrice = Number(data.buyPrice) || 0;
      const safeMarkup = Number(data.markup) || 0;
      const calculatedSellPrice = safeBuyPrice * (1 + safeMarkup / 100);
      
      const formData = new FormData();
      
      if (data.code) formData.append("code", data.code);
      if (data.name) formData.append("name", data.name);
      if (data.category) formData.append("category", data.category);
      if (data.brand) formData.append("brand", data.brand);
      if (data.location) formData.append("location", data.location);
      if (data.supplierCode) formData.append("supplierCode", data.supplierCode);
      
      formData.append("buyPrice", safeBuyPrice.toString());
      formData.append("markup", safeMarkup.toString());
      formData.append("sellPrice", calculatedSellPrice.toFixed(2));
      formData.append("stock", "0");
      formData.append("minStock", (data.minStock || 0).toString());
      
      if (data.maxStock) formData.append("maxStock", data.maxStock.toString());

      const res = await createPart(formData);

      if (res && !res.success && res.message) {
         setServerError(typeof res.message === 'string' ? res.message : "Errore sconosciuto");
      } else {
        setIsOpen(false);
        reset();
      }
    });
  };

  return (
    <>
      {/* 1. IL BOTTONE DI APERTURA (Renderizzato direttamente dal componente) */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20"
      >
        <Plus size={20} />
        Nuovo Prodotto
      </button>

      {/* 2. IL MODALE (Visibile solo se isOpen è true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white">Nuovo Ricambio</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {serverError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                  <AlertCircle size={20} />
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Codice *</label>
                    <input
                      {...register("code")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                      placeholder="COD-123"
                    />
                    {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome *</label>
                    <input
                      {...register("name")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                      placeholder="Filtro Olio"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Categoria *</label>
                    <input
                      {...register("category")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                      placeholder="Motore"
                    />
                    {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Marca</label>
                    <input
                      {...register("brand")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                      placeholder="Bosch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Posizione (Scaffale)</label>
                    <input
                      {...register("location")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                      placeholder="A-12"
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 my-4"></div>
                <h3 className="text-white font-bold mb-3">Prezzi e Stock</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Prezzo Acquisto (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("buyPrice")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ricarico (%)</label>
                    <input
                      type="number"
                      step="1"
                      {...register("markup")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Prezzo Vendita (Calc)</label>
                    <div className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-gray-400 cursor-not-allowed">
                      € {((Number(buyPrice) || 0) * (1 + (Number(markup) || 0) / 100)).toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Scorta Minima</label>
                    <input
                      type="number"
                      {...register("minStock")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Scorta Massima</label>
                    <input
                      type="number"
                      {...register("maxStock")}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-primary hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50"
                  >
                    {isPending ? "Salvataggio..." : <><Save size={20} /> Salva Ricambio</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}