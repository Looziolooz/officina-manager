import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getParts } from "@/app/actions/inventory";
import { addPartToJob, archiveJob } from "@/app/actions/workshop";
import { Package, User, Car, ArrowLeft, Calendar, Gauge, CheckCircle2 } from "lucide-react"; // Rimosso TrendingUp
import Link from "next/link";

interface PartItem {
  id: string;
  name: string;
  code: string;
  stockQuantity: number;
  sellPrice: number;
  buyPrice: number;
}

export default async function DettaglioLavoro({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Risoluzione della Promise params per ottenere l'ID (Next.js 15/16)
  const { id } = await params;

  // 2. Recupero dati della scheda lavoro (Job)
  const job = await prisma.job.findUnique({
    where: { id: id },
    include: {
      vehicle: { 
        include: { customer: true } 
      },
      items: { 
        include: { part: true } 
      }
    }
  });

  if (!job) notFound();

  // 3. Recupero lista ricambi dal magazzino
  const inventoryResponse = await getParts();
  const parts = inventoryResponse.success ? (inventoryResponse.data as PartItem[]) : [];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      
      {/* HEADER: Navigazione e Stato */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/officina" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              Scheda Lavoro <span className="text-blue-600">#{job.id.slice(-5)}</span>
            </h1>
            <div className="flex items-center gap-4 text-slate-500 font-bold uppercase text-[10px] mt-1">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString('it-IT')}</span>
              <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {job.kmCount} KM</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-6 py-2 rounded-2xl font-black uppercase text-xs border shadow-sm ${
            job.status === "ARCHIVIATO" 
            ? "bg-slate-100 text-slate-500 border-slate-200" 
            : "bg-blue-100 text-blue-700 border-blue-200"
          }`}>
            {job.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNA SINISTRA: Cliente e Veicolo */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <h2 className="flex items-center gap-2 font-black uppercase mb-4 text-slate-400 text-[10px] tracking-widest italic">
              <User className="w-4 h-4 text-blue-400" /> Proprietario
            </h2>
            <p className="text-xl font-black uppercase leading-tight">{job.vehicle.customer.lastName} {job.vehicle.customer.firstName}</p>
            <p className="text-sm font-bold text-blue-400 mb-4">{job.vehicle.customer.phone}</p>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 italic">
              {job.vehicle.customer.familyNotes || "Nessuna nota registrata."}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="flex items-center gap-2 font-black uppercase mb-4 text-slate-400 text-[10px] tracking-widest italic">
              <Car className="w-4 h-4 text-slate-400" /> Veicolo
            </h2>
            <p className="text-lg font-black uppercase text-slate-900 leading-tight">{job.vehicle.model}</p>
            <p className="text-blue-600 font-black text-2xl tracking-tighter uppercase mb-4">{job.vehicle.plate}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Anno</p>
                <p className="font-black text-slate-700">{job.vehicle.year || "N/D"}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Chilometri</p>
                <p className="font-black text-slate-700">{job.kmCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA: Gestione Ricambi e Azioni Finali */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="flex items-center gap-2 font-black uppercase text-slate-800">
                <Package className="w-5 h-5 text-orange-500" /> Ricambi Utilizzati
              </h2>
            </div>
            
            {job.status !== "ARCHIVIATO" && (
              <form action={async (formData: FormData) => {
                "use server";
                const partId = formData.get("partId") as string;
                if (partId) await addPartToJob(id, partId);
              }} className="flex flex-col md:flex-row gap-4 mb-10">
                <select 
                  name="partId" 
                  required
                  className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold outline-none focus:border-orange-500 transition-all text-sm"
                >
                  <option value="">Cerca pezzo in magazzino...</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name.toUpperCase()} — Stock: {p.stockQuantity} pz — € {p.sellPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
                <button type="submit" className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-orange-700 transition-all">
                  Aggiungi
                </button>
              </form>
            )}

            <div className="space-y-4">
              {job.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 font-black text-xs text-slate-400">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="font-black uppercase text-sm text-slate-800 tracking-tight">{item.description}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase italic">Codice: {item.part?.code || "MANUALE"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-lg tracking-tighter">€ {(item.unitPrice * item.quantity).toFixed(2)}</p>
                    <div className="text-[9px] font-bold text-green-500 uppercase">
                      Margine: € {((item.unitPrice - item.unitCost) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              
              {job.items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl italic text-slate-400 font-bold uppercase text-xs">
                  Nessun ricambio aggiunto.
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest mb-1">Totale Intervento (IVA Incl.)</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">€ {job.totalCost.toFixed(2)}</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button className="bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-300 transition-all">
                  Stampa Riepilogo
                </button>
                
                {job.status !== "ARCHIVIATO" && (
                  <form action={async () => {
                    "use server";
                    await archiveJob(id);
                    redirect("/admin/officina");
                  }}>
                    <button type="submit" className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-green-700 transition-all flex items-center gap-2">
                      <CheckCircle2 size={16} /> Archivia e Paga
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}