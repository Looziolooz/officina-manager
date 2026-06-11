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
    case JobStatus.PENDING: return { label: "In Attesa", color: "bg-gray-500/20 text-muted-foreground" };
    case JobStatus.IN_PROGRESS: return { label: "In Lavorazione", color: "bg-blue-500/20 text-blue-600" };
    case JobStatus.COMPLETED: return { label: "Completato", color: "bg-green-500/20 text-success" };
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

  const statusInfo = getStatusLabel(job.status ?? JobStatus.SCHEDULED);
  
  // 3. Tipizziamo esplicitamente l'accumulatore del reduce
  const partsTotal = job.parts.reduce((acc: number, item) => {
    return acc + ((item.quantity ?? 0) * (item.appliedPrice ?? 0));
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/workshop" 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tighter">
                
                Lavoro #{job.jobNumber || job.id.slice(-4)}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Clock size={14} />
              Creato il {job.createdAt ? format(job.createdAt, "d MMMM yyyy", { locale: it }) : 'N/D'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNA SINISTRA */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Veicolo */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <Car className="text-primary" size={20} />
                <h3 className="font-bold text-foreground">Veicolo</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Modello</p>
                  <p className="font-bold text-foreground text-lg">
                    {job.vehicle.brand} {job.vehicle.modelName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Targa</p>
                    <p className="font-mono text-foreground">{job.vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Km Attuali</p>
                    <p className="font-mono text-foreground">{job.vehicle.totalKm || 0}</p>
                  </div>
                </div>
                <div className="pt-2">
                   <p className="text-xs text-muted-foreground flex items-center gap-1">
                     <Fuel size={12} /> Alimentazione
                   </p>
                   <p className="text-foreground">
                     {job.vehicle.fuelType || 'Non specificata'}
                   </p>
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <User className="text-blue-600" size={20} />
                <h3 className="font-bold text-foreground">Cliente</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nominativo</p>
                  <p className="font-bold text-foreground text-lg">
                    {job.customer.firstName} {job.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contatti</p>
                  <p className="text-foreground">{job.customer.phone}</p>
                  <p className="text-muted-foreground text-sm">{job.customer.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* LISTA RICAMBI */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Wrench className="text-red-400" size={20} />
                <h3 className="font-bold text-foreground">Ricambi e Materiali</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {job.parts.length} articoli
              </span>
            </div>

            {job.parts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b border-border">
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
                        <td className="py-3 text-foreground">
                          <p className="font-medium">{item.part.name}</p>
                          <p className="text-xs text-muted-foreground">{item.part.code}</p>
                        </td>
                        <td className="py-3 text-center text-foreground">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          € {item.appliedPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right text-foreground font-mono">
                           € {((item.quantity ?? 0) * (item.appliedPrice ?? 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-border">
                    <tr>
                      <td colSpan={3} className="pt-4 text-right text-muted-foreground">Totale Ricambi</td>
                      <td className="pt-4 text-right text-xl font-bold text-foreground">
                        € {partsTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                Nessun ricambio aggiunto a questo lavoro.
              </div>
            )}
          </div>
        </div>

        {/* COLONNA DESTRA */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <FileText className="text-purple-400" size={20} />
                <h3 className="font-bold text-foreground">Descrizione Lavoro</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-foreground">
                {job.description ? (
                  <p>{job.description}</p>
                ) : (
                  <p className="italic text-muted-foreground">Nessuna descrizione fornita.</p>
                )}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}