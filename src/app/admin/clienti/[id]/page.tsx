import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  User, Phone, Mail, Car, Wrench, 
  ArrowLeft, History, Save, FileText, Package
} from "lucide-react"; // [!code warning] Rimossa icona 'Euro' inutilizzata
import { JOB_STATUS } from "@/lib/constants";
import { updateCustomerNotes } from "@/app/actions/workshop";

// Tipo per i parametri (Next.js 15/16)
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerProfilePage({ params }: PageProps) {
  // 1. Attendiamo l'ID
  const { id } = await params;

  // 2. Recuperiamo il cliente con una query profonda
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: {
        include: {
          jobs: {
            orderBy: { startDate: 'desc' },
            include: {
              items: {
                include: { part: true }
              }
            }
          }
        }
      }
    }
  });

  if (!customer) {
    notFound();
  }

  // 3. Elaborazione Dati per la Timeline
  const allJobs = customer.vehicles.flatMap(v => 
    v.jobs.map(j => ({ 
      ...j, 
      vehiclePlate: v.plate, 
      vehicleModel: v.model 
    }))
  ).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // 4. Calcoli Statistici
  const totalSpent = allJobs.reduce((acc, job) => acc + (job.totalCost || 0), 0);
  const totalPartsCost = allJobs.reduce((acc, job) => acc + (job.partsCost || 0), 0);
  const totalLaborCost = allJobs.reduce((acc, job) => acc + (job.laborCost || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clienti" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-slate-400 text-sm">Cliente dal {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Badge VIP basato sulla spesa */}
        {totalSpent > 1000 && (
          <span className="px-4 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold tracking-wider uppercase">
            Cliente Top
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNA SX: Dati & Note */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card Contatti */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-white">Contatti</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="font-mono">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="truncate">{customer.email || "Nessuna email"}</span>
              </div>
            </div>
          </div>

          {/* Card NOTE (Modificabile) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-white">Note Interne</h3>
            </div>
            
            <form action={async (formData) => {
              "use server";
              const notes = formData.get("notes") as string;
              await updateCustomerNotes(id, notes);
            }}>
              <textarea 
                name="notes"
                defaultValue={customer.notes || ""}
                placeholder="Scrivi qui appunti sul cliente (es. preferenze, problemi pagamenti...)"
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-orange-500 outline-none resize-none mb-3"
              />
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Save className="w-4 h-4" /> Salva Note
              </button>
            </form>
          </div>

          {/* Garage Veloce */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              Garage ({customer.vehicles.length})
            </h3>
            <div className="space-y-2">
              {customer.vehicles.map(v => (
                <div key={v.id} className="flex justify-between items-center text-sm p-2 hover:bg-slate-800 rounded cursor-default">
                  <span className="text-slate-300">{v.model}</span>
                  <span className="text-orange-500 font-mono bg-orange-900/10 px-2 py-0.5 rounded border border-orange-900/20">{v.plate}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLONNA DX: Storico Dettagliato */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Spesa Totale</p>
              <p className="text-2xl font-bold text-white mt-1">€ {totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Di cui Ricambi</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">€ {totalPartsCost.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Di cui Manodopera</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">€ {totalLaborCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Timeline Interventi */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-white">Cronologia Interventi</h3>
            </div>

            <div className="divide-y divide-slate-800">
              {allJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  
                  {/* Riga Superiore: Info Principali */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-orange-500 font-mono font-bold">{job.vehiclePlate}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300 font-medium">{job.vehicleModel}</span>
                      </div>
                      <p className="text-white text-lg font-medium">{job.description}</p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Wrench className="w-3 h-3" />
                        {new Date(job.startDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        
                        {job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.DELIVERED ? (
                          <span className="text-green-500 bg-green-900/20 px-2 rounded-full text-xs ml-2">Completato</span>
                        ) : (
                          <span className="text-yellow-500 bg-yellow-900/20 px-2 rounded-full text-xs ml-2">In Corso</span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">€ {job.totalCost.toFixed(2)}</p>
                      <div className="text-xs text-slate-500 mt-1 flex flex-col items-end">
                        <span>Manodopera: € {job.laborCost.toFixed(2)}</span>
                        <span>Pezzi: € {job.partsCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Riga Inferiore: Dettaglio Pezzi Usati */}
                  {job.items.length > 0 && (
                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 mt-4">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                        <Package className="w-3 h-3" /> Pezzi Sostituiti
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {job.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm text-slate-300 border-b border-slate-800/50 pb-1 last:border-0 last:pb-0">
                            <span>
                              <span className="text-orange-500 font-mono">{item.quantity}x</span> {item.part.name}
                            </span>
                            <span className="text-slate-500">€ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {allJobs.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Nessun intervento registrato.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}