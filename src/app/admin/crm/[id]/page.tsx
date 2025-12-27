import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProfiloCliente({ params }: { params: { id: string } }) {
  const cliente = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      vehicles: {
        include: {
          jobs: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!cliente) notFound();

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
        <h1 className="text-4xl font-black text-slate-900 uppercase">{cliente.lastName} {cliente.firstName}</h1>
        <p className="text-slate-500 font-bold">📞 {cliente.phone} | ✉️ {cliente.email}</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm font-bold text-blue-800 uppercase text-[10px]">Note Famiglia:</p>
          <p className="text-slate-700">{cliente.familyNotes || "Nessuna nota"}</p>
        </div>
      </div>

      <h2 className="text-2xl font-black mb-6 uppercase italic text-slate-800 underline decoration-blue-600">Storico Veicoli e Interventi</h2>
      
      <div className="space-y-8">
        {cliente.vehicles.map(veicolo => (
          <div key={veicolo.id} className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
              <h3 className="text-xl font-black uppercase">{veicolo.model} <span className="text-blue-400">[{veicolo.plate}]</span></h3>
              <span className="text-sm font-bold text-slate-400 italic">Anno: {veicolo.year}</span>
            </div>

            <div className="space-y-4">
              {veicolo.jobs.map(job => (
                <div key={job.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 font-bold">{new Date(job.createdAt).toLocaleDateString('it-IT')}</p>
                    <p className="font-bold text-slate-200 uppercase">{job.description}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Stato: {job.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-black">{job.kmCount} KM</p>
                  </div>
                </div>
              ))}
              {veicolo.jobs.length === 0 && <p className="text-slate-500 italic">Nessun intervento registrato.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}