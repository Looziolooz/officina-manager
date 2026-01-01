"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save, Loader2, Calculator } from "lucide-react";
import { createPart } from "@/app/actions/warehouse";

const CATEGORIES = [
  "Olii e Lubrificanti",
  "Filtri",
  "Freni",
  "Sospensioni",
  "Elettrico",
  "Motore",
  "Trasmissione",
  "Carrozzeria",
  "Pneumatici",
  "Varie"
];

export default function NewPartModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Stato iniziale del form
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    brand: "",
    location: "",
    buyPrice: 0,
    markup: 40, // Default 40% ricarico
    minStock: 5,
    maxStock: 20
  });

  // Calcolo prezzo vendita live
  const sellPrice = formData.buyPrice * (1 + formData.markup / 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category' || name === 'code' || name === 'name' || name === 'brand' || name === 'location' 
        ? value 
        : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validazione base
    if (!formData.code || !formData.name || !formData.category) {
      setError("Compila i campi obbligatori (*)");
      setIsLoading(false);
      return;
    }

    try {
      const res = await createPart(formData);
      
      if (res.success) {
        setIsOpen(false);
        // Reset form
        setFormData({
          code: "", name: "", category: "", brand: "", location: "",
          buyPrice: 0, markup: 40, minStock: 5, maxStock: 20
        });
        router.refresh();
      } else {
        const errorMsg = typeof res.error === 'string' ? res.error : "Errore validazione dati";
        setError(errorMsg);
      }
    } catch (err) {
      // FIX: Utilizziamo la variabile err per il log
      console.error("Errore salvataggio ricambio:", err);
      setError("Errore imprevisto durante il salvataggio");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20"
      >
        <Plus size={20} /> Nuovo Prodotto
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Nuovo Ricambio</h2>
            <p className="text-slate-400 text-sm">Inserisci i dettagli del prodotto</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          {/* Sezione 1: Info Generali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Codice *</label>
              <input name="code" value={formData.code} onChange={handleChange} placeholder="Es. OIL-5W30" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" autoFocus />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Nome Ricambio *</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Es. Olio Castrol Edge" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Categoria *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none appearance-none">
                <option value="">-- Seleziona --</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Marca</label>
              <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Es. Castrol" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Sezione 2: Economica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Prezzo Acquisto (€)</label>
              <input type="number" step="0.01" name="buyPrice" value={formData.buyPrice} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Ricarico (%)</label>
              <input type="number" step="1" name="markup" value={formData.markup} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-center">
              <span className="text-xs uppercase font-bold text-emerald-500 flex items-center gap-1">
                <Calculator size={12} /> Prezzo Vendita
              </span>
              <span className="text-xl font-bold text-white">€ {sellPrice.toFixed(2)}</span>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Sezione 3: Logistica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Scorta Minima</label>
              <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Scorta Massima</label>
              <input type="number" name="maxStock" value={formData.maxStock} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Ubicazione</label>
              <input name="location" value={formData.location} onChange={handleChange} placeholder="Es. A1-04" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all">
              Annulla
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Salva Prodotto
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}