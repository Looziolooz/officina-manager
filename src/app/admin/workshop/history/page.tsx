import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react"; // Rimossa 'Search'
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default async function HistoryPage() {
  const archivedJobs = await prisma.job.findMany({
    where: {
      status: "DELIVERED" // Filtra solo quelli archiviati/consegnati
    },
    include: {
      vehicle: { include: { owner: true } }
    },
    orderBy: { completedAt: "desc" },
    take: 100 // Mostra gli ultimi 100
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-gray-400" /> Storico Interventi
          </h1>
          <p className="text-gray-400 text-sm">Archivio lavori completati e consegnati</p>
        </div>
        <Link 
          href="/admin/workshop" 
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
        >
          {/* FIX: Apostrofo escaped */}
          <ArrowLeft size={18} /> Torna all&apos;Officina
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/5 text-gray-100 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">Data Chiusura</th>
              <th className="p-4">Job ID</th>
              <th className="p-4">Veicolo</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Intervento</th>
              <th className="p-4 text-right">Totale</th>
              <th className="p-4 text-center">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {archivedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono">
                  {job.completedAt ? format(job.completedAt, "dd MMM yyyy", { locale: it }) : "-"}
                </td>
                <td className="p-4 font-mono text-xs">{job.jobNumber}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{job.vehicle.plate}</div>
                  <div className="text-xs">{job.vehicle.brand} {job.vehicle.model}</div>
                </td>
                <td className="p-4">
                  {job.vehicle.owner.firstName} {job.vehicle.owner.lastName}
                </td>
                {/* FIX: max-w-[200px] sostituito con max-w-50 (Tailwind v4 standard) */}
                <td className="p-4 truncate max-w-50">{job.title}</td>
                <td className="p-4 text-right font-mono font-bold text-green-400">
                  € {job.totalAmount.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs">
                    <CheckCircle size={12} /> Archiviato
                  </span>
                </td>
              </tr>
            ))}
            {archivedJobs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500">
                  Nessun lavoro archiviato trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}