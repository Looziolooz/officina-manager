import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";
import {
  Car,
  User,
  Clock,
  Wrench,
  ArrowLeft,
  FileText,
  Fuel
} from "lucide-react";
// 1. IMPORTIAMO L'ENUM DAL CLIENT PRISMA
import { JobStatus } from "@prisma/client";

// 2. Usiamo l'Enum nei case invece delle stringhe
const getStatusLabel = (status: JobStatus) => {
  switch (status) {
    case JobStatus.PENDING: return { label: "In Attesa", color: "bg-gray-500/20 text-gray-400" };
    case JobStatus.IN_PROGRESS: return { label: "In Lavorazione", color: "bg-blue-500/20 text-blue-400" };
    case JobStatus.COMPLETED: return { label: "Completato", color: "bg-green-500/20 text-green-400" };
    case JobStatus.CANCELLED: return { label: "Annullato", color: "bg-red-500/20 text-red-400" };
    default: return { label: "N/D", color: "bg-gray-500" };
  }
};

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  // Nota: Se questo dà ancora errore dopo aver aggiornato lo schema, 
  // riavvia il server o riesegui 'npm run build' per rigenerare il client.
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      customer: true,
      vehicle: true,
      parts: {
        include: {
          part: true
        }
      },
    },
  });

  if (!job) {
    notFound();
  }

  const statusInfo = getStatusLabel(job.status);
  
  // 3. Tipizziamo esplicitamente l'accumulatore del reduce
  const partsTotal = job.parts.reduce((acc: number, item) => {
    return acc + (item.quantity * item.appliedPrice);
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/workshop" 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                
                Lavoro #{job.jobNumber || job.id.slice(-4)}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Clock size={14} />
              Creato il {format(job.createdAt, "d MMMM yyyy", { locale: it })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNA SINISTRA */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Veicolo */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <Car className="text-primary" size={20} />
                <h3 className="font-bold text-white">Veicolo</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Modello</p>
                  <p className="font-bold text-white text-lg">
                    {job.vehicle.brand} {job.vehicle.model}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Targa</p>
                    <p className="font-mono text-white">{job.vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Km Attuali</p>
                    <p className="font-mono text-white">{job.vehicle.totalKm || 0}</p>
                  </div>
                </div>
                <div className="pt-2">
                   <p className="text-xs text-gray-500 flex items-center gap-1">
                     <Fuel size={12} /> Alimentazione
                   </p>
                   <p className="text-white">
                     {job.vehicle.fuelType || 'Non specificata'}
                   </p>
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <User className="text-blue-400" size={20} />
                <h3 className="font-bold text-white">Cliente</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Nominativo</p>
                  <p className="font-bold text-white text-lg">
                    {job.customer.firstName} {job.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contatti</p>
                  <p className="text-white">{job.customer.phone}</p>
                  <p className="text-gray-400 text-sm">{job.customer.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* LISTA RICAMBI */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Wrench className="text-orange-400" size={20} />
                <h3 className="font-bold text-white">Ricambi e Materiali</h3>
              </div>
              <span className="text-sm text-gray-400">
                {job.parts.length} articoli
              </span>
            </div>

            {job.parts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500 border-b border-white/5">
                    <tr>
                      <th className="pb-3 font-medium">Articolo</th>
                      <th className="pb-3 font-medium text-center">Q.tà</th>
                      <th className="pb-3 font-medium text-right">Prezzo</th>
                      <th className="pb-3 font-medium text-right">Totale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {job.parts.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-3 text-white">
                          <p className="font-medium">{item.part.name}</p>
                          <p className="text-xs text-gray-500">{item.part.code}</p>
                        </td>
                        <td className="py-3 text-center text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-gray-300">
                          € {item.appliedPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right text-white font-mono">
                          € {(item.quantity * item.appliedPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-white/10">
                    <tr>
                      <td colSpan={3} className="pt-4 text-right text-gray-400">Totale Ricambi</td>
                      <td className="pt-4 text-right text-xl font-bold text-white">
                        € {partsTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                Nessun ricambio aggiunto a questo lavoro.
              </div>
            )}
          </div>
        </div>

        {/* COLONNA DESTRA */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <FileText className="text-purple-400" size={20} />
                <h3 className="font-bold text-white">Descrizione Lavoro</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                {job.description ? (
                  <p>{job.description}</p>
                ) : (
                  <p className="italic text-gray-500">Nessuna descrizione fornita.</p>
                )}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}