"use client";
import { useEffect, useState } from "react";
import { Search, UserPlus, Car, Trophy } from "lucide-react";
import { searchCustomers } from "@/app/actions/customer";

const loyaltyColors = {
  PLATINUM: "bg-slate-300 text-slate-900 border-slate-100",
  GOLD: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  SILVER: "bg-orange-500/20 text-orange-500 border-orange-500/50",
  NONE: "bg-slate-800 text-slate-400 border-white/5",
};



export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await searchCustomers(query);
      setCustomers(data);
    };
    const timer = setTimeout(fetch, 300); // Debounce per non sovraccaricare il DB
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Gestione Clienti</h1>
          <p className="text-gray-500 text-sm">Monitora spesa, veicoli e fedeltà dei clienti.</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-all">
          <UserPlus size={18} /> Nuovo Cliente
        </button>
      </div>

      {/* Barra di Ricerca Avanzata */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input 
          type="text"
          placeholder="Cerca per nome, telefono o targa..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary outline-none transition-all"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Tabella CRM */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-gray-400">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Livello Loyalty</th>
              <th className="px-6 py-4 text-right">Totale Speso</th>
              <th className="px-6 py-4 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-lg">{customer.firstName} {customer.lastName}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${loyaltyColors[customer.loyaltyLevel as keyof typeof loyaltyColors]}`}>
                    {customer.loyaltyLevel}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-primary font-bold">
                  € {customer.totalSpent.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                      <Car size={18} />
                    </button>
                    <button className="p-2 bg-orange-600/20 text-orange-500 rounded-lg hover:bg-orange-600 hover:text-white transition-all">
                      <Trophy size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}