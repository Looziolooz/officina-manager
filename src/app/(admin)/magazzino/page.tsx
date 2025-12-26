import { getParts, addPart, deletePart } from "@/app/actions/inventory";
import { AlertTriangle, Package, Plus, Search, Trash2 } from "lucide-react";

// Definiamo il tipo per il Pezzo (Part) per aiutare TypeScript
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
  // Se c'è un errore o i dati sono nulli, usiamo un array vuoto
  const parts: Part[] = result.success && result.data ? (result.data as Part[]) : [];

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-orange-500" />
            Magazzino Ricambi
          </h1>
          <p className="text-slate-400">Gestisci lo stock e i prezzi dei componenti.</p>
        </div>
        
        {/* Statistiche Rapide */}
        <div className="flex gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500">Valore Totale</p>
            <p className="text-xl font-bold text-white">
              {/* Qui abbiamo tipizzato 'acc' e 'p' */}
              € {parts.reduce((acc: number, p: Part) => acc + (p.sellPrice * p.stockQuantity), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA: Lista Prodotti */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex gap-2">
            <Search className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Cerca per codice o nome..." 
              className="bg-transparent border-none focus:ring-0 text-white w-full outline-none" 
            />
          </div>

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
                        {/* Wrapper client-side per gestire l'azione */}
                        <form action={async () => {
                          "use server";
                          await deletePart(part.id);
                        }}>
                          <button className="text-slate-500 hover:text-red-500 transition-colors p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Magazzino vuoto. Aggiungi il primo prodotto a destra.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLONNA DESTRA: Form Aggiunta */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" />
            Nuovo Articolo
          </h3>
          
          {/* L'azione 'addPart' ora restituisce il tipo corretto per 'action' */}
          <form action={async (formData) => {
              "use server";
              await addPart(formData);
            }} 
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Codice Pezzo</label>
              <input name="code" required type="text" placeholder="Es. OLIO-5W30" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome Prodotto</label>
              <input name="name" required type="text" placeholder="Es. Olio Castrol Edge" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quantità</label>
                <input name="quantity" required type="number" defaultValue="10" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prezzo (€)</label>
                <input name="price" required type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none" />
              </div>
            </div>
            
            <div className="pt-2">
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-orange-900/20 active:scale-95">
                Aggiungi al Magazzino
              </button>
            </div>
          </form>

          <div className="mt-6 bg-orange-500/10 p-4 rounded-lg border border-orange-500/20 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-xs text-orange-200">
              {/* Corrette le virgolette interne usando &quot; */}
              I prodotti con quantità inferiore a 5 verranno segnalati automaticamente in Dashboard come &quot;In Esaurimento&quot;.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}