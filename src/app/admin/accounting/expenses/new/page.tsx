"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/app/actions/accounting";
import { ExpenseCategory } from "@prisma/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NewExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    taxAmount: "0",
    category: "PARTS_PURCHASE" as ExpenseCategory, // Default valido
    expenseDate: new Date().toISOString().split('T')[0],
    supplierName: "",
    isPaid: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      taxAmount: parseFloat(formData.taxAmount),
      category: formData.category,
      expenseDate: new Date(formData.expenseDate),
      supplierName: formData.supplierName,
      isPaid: formData.isPaid
    };

    const res = await createExpense(payload);

    if (res.success) {
      router.push("/admin/accounting");
      router.refresh();
    } else {
      alert("Errore: " + res.error);
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center gap-2 mb-6">
        <ArrowLeft size={18} /> Torna indietro
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">Registra Nuova Spesa</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-6">
        
        {/* Fornitore e Descrizione */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Fornitore *</label>
            <input name="supplierName" required value={formData.supplierName} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white" placeholder="Es. Autoricambi Rossi" />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Descrizione *</label>
            <input name="description" required value={formData.description} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white" placeholder="Es. Acquisto Olio" />
          </div>
        </div>

        {/* Categoria e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Categoria</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white">
              {Object.keys(ExpenseCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Data Spesa</label>
            <input type="date" name="expenseDate" required value={formData.expenseDate} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white" />
          </div>
        </div>

        {/* Importi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Imponibile (€) *</label>
            <input type="number" step="0.01" name="amount" required value={formData.amount} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono text-lg" />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">IVA (€)</label>
            <input type="number" step="0.01" name="taxAmount" value={formData.taxAmount} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono text-lg" />
          </div>
        </div>

        {/* Stato Pagamento */}
        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <input 
            type="checkbox" 
            name="isPaid" 
            id="isPaid"
            checked={formData.isPaid} 
            onChange={handleChange} 
            className="w-5 h-5 accent-emerald-500"
          />
          <label htmlFor="isPaid" className="text-white font-medium cursor-pointer">Segna come già pagata</label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Salva Spesa
        </button>

      </form>
    </div>
  );
}