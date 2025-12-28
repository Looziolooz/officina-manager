"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateJobStatus, archiveJob } from "@/app/actions/workshop";
import { JobWithDetails } from "@/lib/types";
import { Wrench } from "lucide-react";

const COLONNE = [
  { id: "SCHEDULATO", label: "In Attesa", color: "border-slate-300", bg: "bg-slate-100" },
  { id: "IN_LAVORAZIONE", label: "In Officina", color: "border-blue-600", bg: "bg-blue-50" },
  { id: "ATTESA_RICAMBI", label: "Attesa Ricambi", color: "border-orange-500", bg: "bg-orange-50" },
  { id: "COMPLETATO", label: "Lavori Finiti", color: "border-green-600", bg: "bg-green-50" },
];

export default function KanbanClient({ initialJobs }: { initialJobs: JobWithDetails[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function sposta(jobId: string, currentStatus: string, direzione: "avanti" | "indietro") {
    const currentIndex = COLONNE.findIndex(c => c.id === currentStatus);
    const newIndex = direzione === "avanti" ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < COLONNE.length) {
      setLoadingId(jobId);
      await updateJobStatus(jobId, COLONNE[newIndex].id);
      router.refresh();
      setLoadingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {COLONNE.map((col) => (
        <div key={col.id} className={`rounded-3xl flex flex-col min-h-[70vh] ${col.bg} border-2 ${col.color} p-4 shadow-inner`}>
          <h2 className="font-black text-slate-800 uppercase mb-5 text-center italic tracking-tighter">
            {col.label}
          </h2>
          <div className="space-y-4">
            {initialJobs
              .filter(j => j.status === col.id)
              .map((job) => (
                <div key={job.id} className={`bg-white p-5 rounded-2xl shadow-md border-l-8 ${col.color} transition-all ${loadingId === job.id ? "opacity-40 scale-95" : "hover:shadow-lg"}`}>
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                      {job.vehicle.plate}
                    </span>
                    <Link href={`/admin/officina/${job.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Wrench size={16} />
                    </Link>
                  </div>

                  <p className="font-black text-slate-900 uppercase text-sm leading-tight">
                    {job.vehicle.customer.lastName} {job.vehicle.customer.firstName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-bold italic mb-3">
                    {job.vehicle.model}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase italic">Ricambi</p>
                      <p className="text-xs font-black text-slate-700">€ {job.partsCost?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase italic">Costo Totale</p>
                      <p className="text-xs font-black text-blue-700">€ {job.totalCost?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    {job.status === "COMPLETATO" ? (
                      <button 
                        onClick={async () => {
                          if(confirm("Vuoi archiviare l'intervento e procedere alla fatturazione?")) {
                            setLoadingId(job.id);
                            await archiveJob(job.id);
                            router.refresh();
                            setLoadingId(null);
                          }
                        }}
                        className="w-full py-2 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] hover:bg-green-700 shadow-md"
                      >
                        ✅ Fattura e Archivia
                      </button>
                    ) : (
                      <>
                        <button 
                          disabled={col.id === "SCHEDULATO" || loadingId === job.id}
                          onClick={() => sposta(job.id, job.status, "indietro")}
                          className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 disabled:opacity-0 transition-all"
                        >⬅️</button>
                        
                        <Link href={`/admin/clienti/${job.vehicle.customer.id}`} className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors">
                          Storico
                        </Link>
                        
                        <button 
                          disabled={col.id === "COMPLETATO" || loadingId === job.id}
                          onClick={() => sposta(job.id, job.status, "avanti")}
                          className="p-2 bg-slate-900 text-white rounded-full hover:bg-blue-600 disabled:opacity-0 transition-all shadow-md"
                        >➡️</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}