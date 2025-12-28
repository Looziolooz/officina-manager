import { getParts, addPart, deletePart } from "@/app/actions/inventory";
import { Package, Plus, Trash2 } from "lucide-react";

// Definiamo il tipo per il Pezzo (Part)
type Part = {
  id: string;
  code: string;
  name: string;
  stockQuantity: number;
  sellPrice: number;
  minThreshold: number;
};

export default async function MagazzinoPage() {
  const result = await getParts();
  const parts: Part[] = result.success && result.data ? (result.data as Part[]) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-orange-500" /> Magazzino Ricambi
          </h1>
          <p className="text-slate-400">Gestisci lo stock e i prezzi dei componenti.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500">Valore Totale</p>
            <p className="text-xl font-bold text-white">
              € {parts.reduce((acc: number, p: Part) => acc + (p.sellPrice * p.stockQuantity), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Codice</th>
                  <th className="px-6 py-4">Prodotto</th>
                  <th className="px-6 py-4 text-center">Q.tà</th>
                  <th className="px-6 py-4">Prezzo</th>
                  <th className="px-6 py-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {parts.length > 0 ? (
                  parts.map((part: Part) => (
                    <tr key={part.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-orange-500">{part.code}</td>
                      <td className="px-6 py-4 font-medium text-white">{part.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          part.stockQuantity <= part.minThreshold 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {part.stockQuantity} pz
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">€ {part.sellPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        {/* Risoluzione errore tipi action */}
                        <form action={async () => {
                          "use server";
                          await deletePart(part.id);
                        }}>
                          <button type="submit" className="text-slate-500 hover:text-red-500 transition-colors p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-6 py-12 text-center">Magazzino vuoto.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" /> Nuovo Articolo
          </h3>
          <form action={async (formData: FormData) => {
              "use server";
              await addPart(formData);
            }} 
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Codice Pezzo</label>
              <input name="code" required type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome Prodotto</label>
              <input name="name" required type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="quantity" required type="number" placeholder="Qtà" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              <input name="price" required type="number" step="0.01" placeholder="Prezzo" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg">
              Aggiungi al Magazzino
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}