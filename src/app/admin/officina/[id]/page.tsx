import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
// [!code warning] Rimossi Car e CheckCircle2 dagli import
import { 
  ArrowLeft, Calendar, User, Wrench, 
  Package, Plus, Trash2, Save 
} from "lucide-react";
import { JOB_STATUS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// Definiamo il tipo per i params come Promise (per Next.js 15/16)
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage({ params }: PageProps) {
  // 1. Attendiamo i parametri (FIX per l'errore precedente)
  const { id } = await params;

  // 2. Recupera Dati Lavoro + Pezzi Usati
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      vehicle: {
        include: {
          customer: true
        }
      },
      items: {
        include: {
          part: true
        }
      }
    }
  });

  if (!job) {
    notFound();
  }

  // Recupera tutti i pezzi dal magazzino per la select
  const allParts = await prisma.part.findMany({
    orderBy: { name: 'asc' }
  });

  // Funzioni Server Actions
  async function addPart(formData: FormData) {
    "use server";
    const partId = formData.get("partId") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    
    if (!partId || quantity < 1) return;

    const part = await prisma.part.findUnique({ where: { id: partId } });
    if (!part) return;

    await prisma.jobItem.create({
      data: {
        jobId: id,
        partId: partId,
        quantity: quantity,
        unitPrice: part.sellPrice
      }
    });

    // Aggiorna totale lavoro
    const currentTotal = job!.totalCost + (part.sellPrice * quantity);
    const currentParts = job!.partsCost + (part.sellPrice * quantity);
    
    await prisma.job.update({
      where: { id },
      data: { totalCost: currentTotal, partsCost: currentParts }
    });

    revalidatePath(`/admin/officina/${id}`);
  }

  async function removePart(itemId: string, cost: number) {
    "use server";
    await prisma.jobItem.delete({ where: { id: itemId } });
    
    // Ricalcola totali
    await prisma.job.update({
      where: { id },
      data: { 
        partsCost: { decrement: cost },
        totalCost: { decrement: cost }
      }
    });
    revalidatePath(`/admin/officina/${id}`);
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/admin/officina" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white font-mono tracking-wider">{job.vehicle.plate}</h1>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
              {job.status}
            </span>
          </div>
          <p className="text-slate-400">{job.vehicle.model}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SX: INFO E AGGIUNTA PEZZI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DETTAGLI LAVORO */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
             <div className="flex items-start gap-3">
                <Wrench className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-white">Descrizione Lavoro</h3>
                  <p className="text-slate-400">{job.description}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <User className="w-4 h-4" />
                  {job.vehicle.customer.firstName} {job.vehicle.customer.lastName}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {job.startDate.toLocaleDateString()}
                </div>
             </div>
          </div>

          {/* LISTA PEZZI USATI */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Package className="text-blue-500" />
              Ricambi & Materiali
            </h3>

            <div className="space-y-3">
              {job.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <p className="text-white font-medium">{item.part.name}</p>
                    <p className="text-xs text-slate-500">{item.quantity} x € {item.unitPrice}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-white font-mono">€ {(item.quantity * item.unitPrice).toFixed(2)}</p>
                    {job.status !== JOB_STATUS.DELIVERED && (
                      <form action={removePart.bind(null, item.id, item.quantity * item.unitPrice)}>
                        <button className="text-red-500 hover:text-red-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              
              {job.items.length === 0 && <p className="text-slate-500 text-sm italic">Nessun pezzo aggiunto.</p>}
            </div>

            {/* FORM AGGIUNTA PEZZO */}
            {job.status !== JOB_STATUS.DELIVERED && (
              <form action={addPart} className="mt-6 pt-6 border-t border-slate-800 flex gap-2">
                <select name="partId" className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">Seleziona Ricambio...</option>
                  {allParts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Disp: {p.stockQuantity}) - €{p.sellPrice}</option>
                  ))}
                </select>
                <input type="number" name="quantity" defaultValue={1} min={1} className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* COLONNA DX: TOTALI */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6">Riepilogo Costi</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Manodopera</span>
                <span>€ {job.laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ricambi</span>
                <span>€ {job.partsCost.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-800 my-2"></div>
              <div className="flex justify-between text-white font-bold text-lg">
                <span>TOTALE</span>
                <span className="text-orange-500">€ {job.totalCost.toFixed(2)}</span>
              </div>
            </div>

            <button disabled className="w-full bg-slate-800 text-slate-500 py-3 rounded-lg font-medium cursor-not-allowed flex justify-center gap-2 mb-2">
              <Save className="w-4 h-4" /> Aggiorna Manodopera
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}