"use client";
import { Package, AlertTriangle, Plus } from "lucide-react"; 

const parts = [
  { id: "1", code: "5W30-EXT", name: "Olio Castrol Edge 5W30", stock: 12, minStock: 5, price: 18.50 },
  { id: "2", code: "BOS-F001", name: "Filtro Carburante Diesel", stock: 1, minStock: 3, price: 24.00 },
];

export default function InventoryPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">MAGAZZINO RICAMBI</h1>
          <p className="text-gray-500 text-sm">Monitoraggio scorte e inventario GT Service.</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus size={18} /> Carico Merce
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center">
            <Package className="text-blue-500" />
            <span className="text-2xl font-bold text-white">142</span>
          </div>
          <p className="text-gray-500 text-xs uppercase mt-2 font-bold tracking-widest">Totale Articoli</p>
        </div>
        <div className="bg-orange-500/10 p-6 rounded-2xl border border-orange-500/20">
          <div className="flex justify-between items-center">
            <AlertTriangle className="text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">3</span>
          </div>
          <p className="text-orange-500/50 text-xs uppercase mt-2 font-bold tracking-widest">Sottoscorta</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase text-gray-400">
            <tr>
              <th className="px-6 py-4">Codice / Nome</th>
              <th className="px-6 py-4 text-center">Giacenza</th>
              <th className="px-6 py-4 text-right">Prezzo Un.</th>
              <th className="px-6 py-4 text-center">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-mono text-primary text-xs">{part.code}</div>
                  <div className="text-white font-semibold">{part.name}</div>
                </td>
                <td className="px-6 py-4 text-center text-white font-bold">{part.stock}</td>
                <td className="px-6 py-4 text-right text-gray-400">€{part.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  {part.stock <= part.minStock ? (
                    <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Ordine Necessario</span>
                  ) : (
                    <span className="bg-green-500/20 text-green-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Disponibile</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}