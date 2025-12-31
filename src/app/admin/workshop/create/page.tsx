"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Wrench, Trash2, Save, Euro, TrendingUp, AlertCircle } from "lucide-react";
import { createWorkshopJob } from "@/app/actions/workshop";

export default function CreateJobPage() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const router = useRouter();

  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<{partId: string, qty: number}[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [title, setTitle] = useState("Manutenzione Ordinaria");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/inventory").then(res => res.json()).then(setInventory);
  }, []);

  const addPart = (id: string) => {
    setSelectedParts(prev => [...prev, { partId: id, qty: 1 }]);
  };

  const removePart = (index: number) => {
    setSelectedParts(prev => prev.filter((_, i) => i !== index));
  };

  const partsTotal = selectedParts.reduce((sum, item) => {
    const part = inventory.find(p => p.id === item.partId);
    return sum + (part?.sellPrice || 0) * item.qty;
  }, 0);

  const partsCost = selectedParts.reduce((sum, item) => {
    const part = inventory.find(p => p.id === item.partId);
    return sum + (part?.buyPrice || 0) * item.qty;
  }, 0);

  const totalAmount = partsTotal + laborCost;
  const totalMargin = (partsTotal - partsCost) + laborCost;

  const handleSubmit = async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);

    const formattedParts = selectedParts.map(p => {
      const invPart = inventory.find(i => i.id === p.partId);
      return {
        partId: p.partId,
        quantity: p.qty,
        appliedPrice: invPart?.sellPrice || 0
      };
    });

    const result = await createWorkshopJob({
      vehicleId,
      title,
      laborCost,
      parts: formattedParts
    });

    if (result.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Errore durante il salvataggio");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wrench className="text-orange-500" /> Apertura Intervento
        </h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Titolo Intervento</h2>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/20 border border-white/5 p-4 rounded-xl outline-none focus:border-primary transition-all"
              placeholder="Esempio: Tagliando Completo + Freni"
            />
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Ricambi</h2>
            <div className="space-y-3 mb-4">
              {selectedParts.map((item, index) => {
                const part = inventory.find(p => p.id === item.partId);
                return (
                  <div key={index} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="font-bold">{part?.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-green-400">€ {part?.sellPrice.toFixed(2)}</span>
                      <button onClick={() => removePart(index)} className="text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <select 
              onChange={(e) => addPart(e.target.value)}
              className="w-full bg-blue-600/20 border border-blue-500/30 p-3 rounded-xl text-blue-400 font-bold cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>+ Aggiungi ricambio...</option>
              {inventory.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name} ({p.stock} disp.)</option>
              ))}
            </select>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Manodopera</h2>
            <div className="relative">
              <Euro className="absolute left-4 top-4 text-gray-500" size={20} />
              <input 
                type="number" 
                className="w-full bg-black/20 border border-white/5 p-4 pl-12 rounded-xl"
                placeholder="0.00"
                onChange={(e) => setLaborCost(Number(e.target.value))}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl sticky top-24">
            <h2 className="text-gray-500 font-bold mb-6 uppercase text-xs tracking-widest">Riepilogo Finanziario</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between"><span>Lavoro</span><span className="font-mono text-primary font-bold">€ {totalAmount.toFixed(2)}</span></div>
              <div className="bg-green-500/10 p-4 rounded-xl">
                 <div className="text-[10px] text-green-500 font-bold uppercase mb-1">Margine Stimato</div>
                 <div className="text-2xl font-black text-green-400 font-mono">€ {totalMargin.toFixed(2)}</div>
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading || !vehicleId}
              className="w-full bg-primary hover:bg-orange-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Save size={20} /> {loading ? "Salvataggio..." : "Inizia Lavoro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}