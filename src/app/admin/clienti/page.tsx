import { prisma } from "@/lib/prisma";
import { Mail, Search, History, Users, Link } from "lucide-react";

export default async function ClientiPage() {
  // Recupera clienti con i loro veicoli
  const customers = await prisma.customer.findMany({
    include: { vehicles: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      
      {/* HEADER & AZIONI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-orange-500 w-8 h-8" />
            Gestione Clienti (CRM)
          </h1>
          <p className="text-slate-400">Database clienti e storico interventi.</p>
        </div>
        
        {/* Bottone Test Automazione */}
        <form action="/api/cron/reminders" method="GET" target="_blank">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors">
            <Mail className="w-4 h-4 text-orange-500" />
            Test Invio Avvisi
          </button>
        </form>
      </div>

      {/* STATISTICHE VELOCI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 text-sm">Totale Clienti</h3>
          <p className="text-3xl font-bold text-white mt-2">{customers.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 text-sm">Email Marketing</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {customers.filter(c => c.email && !c.email.includes("no-mail")).length} <span className="text-sm font-normal text-slate-500">iscritti</span>
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 text-sm">Veicoli Gestiti</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {customers.reduce((acc, c) => acc + c.vehicles.length, 0)}
          </p>
        </div>
      </div>

      {/* LISTA CLIENTI */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
            <input 
              placeholder="Cerca per nome, targa o telefono..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contatti</th>
                <th className="px-6 py-4">Veicoli</th>
                <th className="px-6 py-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {/* AGGIUNGIAMO IL LINK QUI SOTTO */}
                    <Link href={`/admin/clienti/${c.id}`} className="hover:text-orange-500 hover:underline decoration-orange-500 underline-offset-4">
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{c.phone}</span>
                      <span className="text-xs text-slate-500">{c.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {c.vehicles.map(v => (
                        <span key={v.id} className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-xs font-mono text-orange-400">
                          {v.plate}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 justify-end ml-auto">
                      <History className="w-4 h-4" /> Storico
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}