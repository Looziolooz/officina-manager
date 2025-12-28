import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Phone, Mail, ArrowLeft, History, Save, FileText, Car, TrendingUp 
} from "lucide-react"; 
import { updateCustomerNotes } from "@/app/actions/workshop";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfiloClientePage({ params }: PageProps) {
  // 1. Risoluzione della Promise params
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Protezione contro ID undefined prima della chiamata Prisma
  if (!id) {
    console.error("ID cliente mancante nei parametri della pagina");
    notFound();
  }

  // 2. Recupero dati cliente con relazioni complete
  const customer = await prisma.customer.findUnique({
    where: { id: id },
    include: {
      vehicles: {
        include: {
          jobs: {
            orderBy: { createdAt: 'desc' },
            include: {
              items: { include: { part: true } }
            }
          }
        }
      },
      accountingRecords: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!customer) notFound();

  // 3. Calcolo statistiche e consolidamento dati
  const allJobs = customer.vehicles.flatMap(v => 
    v.jobs.map(j => ({ 
      ...j, 
      vehiclePlate: v.plate, 
      vehicleModel: v.model 
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totaleFatturato = customer.accountingRecords.reduce((acc, r) => acc + r.amount, 0);
  const totaleMargine = customer.accountingRecords.reduce((acc, r) => acc + r.margin, 0);

  return (
    <div className="space-y-8 pb-10 bg-black min-h-screen p-6 text-white">
      {/* INTESTAZIONE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clienti" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
              Registrato il {new Date(customer.createdAt).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLONNA INFO E NOTE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-black text-slate-500 mb-6 uppercase text-[10px] tracking-widest">Recapiti Cliente</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300 p-4 bg-black rounded-2xl border border-slate-800">
                <Phone className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 p-4 bg-black rounded-2xl border border-slate-800">
                <Mail className="w-4 h-4 text-purple-500" />
                <span className="truncate text-sm">{customer.email || "Email non fornita"}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-orange-500" />
              <h3 className="font-black text-white uppercase text-xs tracking-tight">Note Officina</h3>
            </div>
            <form action={async (formData) => {
              "use server";
              const notes = formData.get("notes") as string;
              await updateCustomerNotes(id, customer.familyNotes || "", notes);
            }}>
              <textarea 
                name="notes"
                defaultValue={customer.notes || ""}
                placeholder="Note tecniche, preferenze o scadenze..."
                className="w-full h-32 bg-black border border-slate-700 rounded-2xl p-4 text-sm text-slate-300 focus:border-orange-500 outline-none resize-none mb-3 transition-all"
              />
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all">
                <Save className="w-4 h-4" /> Salva Note Cliente
              </button>
            </form>
          </div>
        </div>

        {/* COLONNA STATISTICHE E STORICO */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI PERFORMANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Fatturato Totale</p>
              <p className="text-3xl font-black text-white tracking-tighter">€ {totaleFatturato.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Margine Netto Ricambi</p>
              <p className="text-3xl font-black text-green-500 tracking-tighter">€ {totaleMargine.toFixed(2)}</p>
            </div>
          </div>

          {/* VEICOLI */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-black text-white uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-400" /> Parco Auto Associato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.vehicles.map(v => (
                <div key={v.id} className="p-4 bg-black border border-slate-800 rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
                  <div>
                    <p className="text-blue-500 font-black font-mono tracking-tighter text-lg">{v.plate}</p>
                    <p className="text-white font-bold text-xs uppercase">{v.model}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-black uppercase italic">
                    {v.kmCount} KM
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRONOLOGIA INTERVENTI */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="font-black text-white uppercase text-[10px] tracking-widest">Storico Interventi Archiviati</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {allJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500 font-mono font-black text-sm uppercase">{job.vehiclePlate}</span>
                        <span className="text-slate-700">/</span>
                        <span className="text-slate-400 font-bold text-[10px] uppercase">{new Date(job.createdAt).toLocaleDateString('it-IT')}</span>
                      </div>
                      <p className="text-white font-medium uppercase text-xs leading-relaxed max-w-md">{job.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white tracking-tighter">€ {job.totalCost?.toFixed(2)}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] font-black text-green-500 uppercase mt-1 tracking-tighter">
                        <TrendingUp className="w-2 h-2" /> Utile: € {(job.totalCost - job.partsCost).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {allJobs.length === 0 && (
                <div className="p-12 text-center text-slate-600 font-black uppercase text-[10px] italic">
                  Nessun intervento registrato per questo profilo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}