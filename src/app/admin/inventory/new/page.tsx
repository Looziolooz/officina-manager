"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Hash, Tag, Euro, Database } from "lucide-react";

export default function NewPartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get("code"),
      name: formData.get("name"),
      buyPrice: parseFloat(formData.get("buyPrice") as string),
      sellPrice: parseFloat(formData.get("sellPrice") as string),
      stock: parseInt(formData.get("stock") as string),
      minStock: parseInt(formData.get("minStock") as string),
    };

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/inventory");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Nuovo Ricambio</h1>
        <p className="text-gray-400">Aggiungi un articolo al magazzino</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2"><Hash size={14}/> Codice Ricambio</label>
            <input name="code" required className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" placeholder="es. FLT-2024" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2"><Tag size={14}/> Nome Articolo</label>
            <input name="name" required className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" placeholder="es. Filtro Olio" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2"><Euro size={14}/> Prezzo Acquisto (€)</label>
            <input name="buyPrice" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2"><Euro size={14}/> Prezzo Vendita (€)</label>
            <input name="sellPrice" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2"><Database size={14}/> Quantità Iniziale</label>
            <input name="stock" type="number" defaultValue="0" className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2"><Package size={14}/> Scorta Minima</label>
            <input name="minStock" type="number" defaultValue="5" className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
          </div>
        </div>

        <button disabled={loading} className="w-full bg-primary py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity">
          {loading ? "Salvataggio..." : "Salva Articolo"}
        </button>
      </form>
    </div>
  );
}