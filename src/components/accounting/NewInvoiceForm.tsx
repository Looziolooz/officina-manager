"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createManualInvoice } from "@/app/actions/accounting";
import { PaymentMethod } from "@prisma/client";
import { Plus, Trash2, Save, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface CustomerProp {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  vatNumber: string | null;
}

export default function NewInvoiceForm({ customers }: { customers: CustomerProp[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Stato del Form
  const [formData, setFormData] = useState({
    customerId: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // +30 giorni
    paymentMethod: "BANK_TRANSFER" as PaymentMethod,
    notes: ""
  });

  // Stato delle Righe
  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 22 }
  ]);

  // Gestione Input Generici
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestione Righe
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    // @ts-expect-error - gestione dinamica semplice dei campi
    newItems[index][field] = field === 'description' ? value : parseFloat(value as string) || 0;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 22 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calcolo Totali Live
  const calculateTotals = () => {
    const subtotal = items.reduce((acc, item) => {
      return acc + (item.quantity * item.unitPrice * (1 - item.discount / 100));
    }, 0);
    const tax = subtotal * 0.22;
    return { subtotal, tax, total: subtotal + tax };
  };

  const totals = calculateTotals();

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return alert("Seleziona un cliente");
    
    setIsLoading(true);

    const payload = {
      ...formData,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      items: items
    };

    try {
      const res = await createManualInvoice(payload);
      if (res.success) {
        router.push("/admin/accounting");
        router.refresh();
      } else {
        alert("Errore salvataggio");
      }
    } catch (error) {
        console.error(error);
      alert("Errore imprevisto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button type="button" onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center gap-2">
        <ArrowLeft size={18} /> Annulla
      </button>

      <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-6">
        
        {/* Intestazione */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Cliente *</label>
            <select name="customerId" required value={formData.customerId} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white">
              <option value="">-- Seleziona Cliente --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName || `${c.lastName} ${c.firstName}`} {c.vatNumber ? `(P.IVA: ${c.vatNumber})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
             <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Metodo Pagamento</label>
             <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white">
               {Object.keys(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Data Emissione</label>
            <input type="date" name="issueDate" required value={formData.issueDate} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Scadenza</label>
            <input type="date" name="dueDate" required value={formData.dueDate} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Righe Fattura */}
        <div>
           <h3 className="text-white font-bold mb-3">Righe Fattura</h3>
           <div className="space-y-3">
             {items.map((item, index) => (
               <div key={index} className="grid grid-cols-12 gap-2 items-end bg-white/5 p-3 rounded-xl border border-white/5">
                 <div className="col-span-5">
                    <label className="text-[10px] uppercase text-slate-500 block">Descrizione</label>
                    <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full bg-transparent border-b border-white/20 text-white p-1 text-sm focus:border-orange-500 outline-none" placeholder="Descrizione prodotto/servizio" required />
                 </div>
                 <div className="col-span-2">
                    <label className="text-[10px] uppercase text-slate-500 block">Qta</label>
                    <input type="number" step="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full bg-transparent border-b border-white/20 text-white p-1 text-sm font-mono text-center" />
                 </div>
                 <div className="col-span-2">
                    <label className="text-[10px] uppercase text-slate-500 block">Prezzo (€)</label>
                    <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="w-full bg-transparent border-b border-white/20 text-white p-1 text-sm font-mono text-right" />
                 </div>
                 <div className="col-span-2">
                    <label className="text-[10px] uppercase text-slate-500 block">Sconto %</label>
                    <input type="number" step="1" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', e.target.value)} className="w-full bg-transparent border-b border-white/20 text-white p-1 text-sm font-mono text-center" />
                 </div>
                 <div className="col-span-1 flex justify-center pb-2">
                   <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
                     <Trash2 size={18} />
                   </button>
                 </div>
               </div>
             ))}
           </div>
           
           <button type="button" onClick={addItem} className="mt-4 flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300">
             <Plus size={16} /> Aggiungi Riga
           </button>
        </div>

        {/* Totali */}
        <div className="flex flex-col items-end pt-4 border-t border-white/10">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Imponibile:</span>
              <span>€ {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>IVA (22%):</span>
              <span>€ {totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-xl font-bold border-t border-white/10 pt-2 mt-2">
              <span>TOTALE:</span>
              <span>€ {totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Emetti Fattura
        </button>

      </div>
    </form>
  );
}