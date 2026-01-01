import { prisma } from "@/lib/db";
import KanbanBoard from "@/components/workshop/KanbanBoard";
import Link from "next/link";
import { Plus, Wrench, History, Activity, AlertCircle, Coins } from "lucide-react";

export default async function WorkshopPage() {
  // 1. Recupero Dati
  const jobs = await prisma.job.findMany({
    where: { status: { not: "DELIVERED" } },
    include: { vehicle: true, assignedTo: true },
    orderBy: { updatedAt: "desc" },
  });

  // 2. Calcolo KPI "al volo" per la dashboard
  const stats = {
    active: jobs.length,
    critical: jobs.filter(j => j.priority === 2).length,
    // Stima grezza del valore in "In Lavorazione" e "Completati"
    estimatedValue: jobs.reduce((acc, job) => acc + job.totalAmount, 0)
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
      {/* --- HEADER & AZIONI --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter uppercase flex items-center gap-3 mb-1">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <Wrench className="text-orange-500" size={24} />
            </div>
            Dashboard Officina
          </h1>
          <p className="text-gray-400 text-sm">Gestione operativa e flussi di lavoro</p>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href="/admin/workshop/history" 
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/10 text-sm"
          >
            <History size={18} /> Archivio
          </Link>
          <Link 
            href="/admin/workshop/new" 
            className="bg-primary hover:bg-orange-700 hover:scale-105 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 text-sm"
          >
            <Plus size={18} /> Nuovo Intervento
          </Link>
        </div>
      </div>

      {/* --- KPI RAPIDI --- */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Lavori Attivi</p>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Critici / Urgenti</p>
            <p className="text-2xl font-bold text-white">{stats.critical}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/10 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Coins size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Valore in Board</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">
              € {stats.estimatedValue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* --- KANBAN BOARD --- */}
      <div className="flex-1 overflow-hidden pb-2">
        <KanbanBoard initialJobs={jobs} />
      </div>
    </div>
  );
}