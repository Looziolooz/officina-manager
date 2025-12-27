"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import mancante risolto
import { updateJobStatus, archiveJob } from "@/app/actions/workshop";
import { JobWithDetails } from "@/lib/types";

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
        <div key={col.id} className={`rounded-3xl flex flex-col min-h-[70vh] ${col.bg} border-2 ${col.color} p-4`}>
          <h2 className="font-black text-slate-800 uppercase mb-5 text-center italic">{col.label}</h2>
          <div className="space-y-4">
            {initialJobs
              .filter(j => j.status === col.id)
              .map((job) => (
                <div key={job.id} className={`bg-white p-5 rounded-2xl shadow-md border-l-8 ${col.color} ${loadingId === job.id ? "opacity-40" : ""}`}>
                  <div className="flex justify-between mb-2">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded uppercase">{job.vehicle.plate}</span>
                  </div>
                  <p className="font-black text-slate-900 uppercase text-sm">{job.vehicle.customer.lastName} {job.vehicle.customer.firstName}</p>
                  <p className="text-xs text-slate-500 italic mb-4">{job.vehicle.model}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    {job.status === "COMPLETATO" ? (
                      <button 
                        onClick={async () => {
                          setLoadingId(job.id);
                          await archiveJob(job.id);
                          router.refresh();
                          setLoadingId(null);
                        }}
                        className="w-full py-2 bg-green-600 text-white rounded-xl font-black uppercase text-[10px]"
                      >
                        ✅ Archivia
                      </button>
                    ) : (
                      <>
                        <button 
                          disabled={col.id === "SCHEDULATO" || loadingId === job.id}
                          onClick={() => sposta(job.id, job.status, "indietro")}
                          className="p-2 bg-slate-100 rounded-full disabled:opacity-0"
                        >⬅️</button>
                        
                        <Link href={`/admin/clienti/${job.vehicle.customer.id}`} className="text-[10px] font-black text-blue-600 uppercase">Storico</Link>
                        
                        <button 
                          disabled={col.id === "COMPLETATO" || loadingId === job.id}
                          onClick={() => sposta(job.id, job.status, "avanti")}
                          className="p-2 bg-slate-900 text-white rounded-full disabled:opacity-0"
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