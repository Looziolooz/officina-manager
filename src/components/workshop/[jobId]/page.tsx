import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { JobStatusBadge } from "@/components/ui/StatusBadge"; // Ipotetico componente
// ... imports icons

export default async function JobDetailsPage({ params }: { params: { jobId: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.jobId },
    include: {
      vehicle: { include: { owner: true } },
      parts: { include: { part: true } },
      notes: { include: { author: true } },
      photos: true
    }
  });

  if (!job) notFound();

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl text-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono opacity-50">#{job.jobNumber}</span>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <span>{job.vehicle.brand} {job.vehicle.model}</span>
            <span>•</span>
            <span className="font-mono bg-white/10 px-2 rounded">{job.vehicle.plate}</span>
            <span>•</span>
            <span>Ingresso: {job.kmAtEntry.toLocaleString()} km</span>
          </div>
        </div>
        
        {/* KPI Rapidi */}
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-xs text-slate-400 uppercase">Totale</div>
            <div className="text-xl font-bold font-mono text-green-400">€ {job.totalAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase">Margine</div>
            <div className="text-xl font-bold font-mono text-blue-400">€ {job.margin.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 4. NOTE & DESCRIZIONE */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📝 Note Operative</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mb-6 text-sm">
              {job.description || "Nessuna descrizione fornita."}
            </div>
            
            <div className="space-y-4">
              {job.notes.map(note => (
                <div key={note.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {note.author.name.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-r-xl rounded-bl-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">{note.author.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {formatDistanceToNow(note.createdAt, { addSuffix: true, locale: it })}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. RICAMBI */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">📦 Ricambi Utilizzati</h2>
              <button className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition">
                + Aggiungi
              </button>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3">Codice</th>
                  <th className="px-4 py-3">Ricambio</th>
                  <th className="px-4 py-3 text-center">Qta</th>
                  <th className="px-4 py-3 text-right">Prezzo</th>
                  <th className="px-4 py-3 text-right">Totale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {job.parts.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono">{p.part.code}</td>
                    <td className="px-4 py-3">{p.part.name}</td>
                    <td className="px-4 py-3 text-center">{p.quantity}</td>
                    <td className="px-4 py-3 text-right">€ {p.appliedPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      € {(p.appliedPrice * p.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* RIGHT COLUMN: Info & Actions */}
        <div className="space-y-8">
          
          {/* 3. INFO CLIENTE */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Cliente</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">{job.vehicle.owner.firstName.charAt(0)}</span>
              </div>
              <div>
                <div className="font-bold text-lg">{job.vehicle.owner.firstName} {job.vehicle.owner.lastName}</div>
                <div className="text-slate-500 text-sm">{job.vehicle.owner.phone}</div>
              </div>
            </div>
            <a href={`https://wa.me/${job.vehicle.owner.phone}`} target="_blank" className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-bold transition">
              💬 WhatsApp
            </a>
          </section>

          {/* 8. TRACKING MANUTENZIONE */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Manutenzione</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Prossimo Olio</span>
                <span className={`font-mono font-bold ${
                  job.vehicle.totalKm >= (job.nextOilChange || 999999) ? 'text-red-500' : 'text-slate-700'
                }`}>
                  {job.nextOilChange || 'N/D'} km
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(((job.vehicle.totalKm / (job.nextOilChange || 1)) * 100), 100)}%` }}
                ></div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}