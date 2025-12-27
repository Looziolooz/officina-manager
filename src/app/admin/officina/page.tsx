"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
// RIMOSSI: MoreHorizontal e Filter
import { 
  Plus, Search, Calendar, User, 
  ArrowRight, ArrowLeft, CheckCircle 
} from "lucide-react";

interface Job {
  id: string;
  status: string; // 'todo' | 'progress' | 'done'
  customer: string;
  vehicle: string;
  plate: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function WorkshopPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carica i dati
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedJobs = localStorage.getItem("workshopJobs");
      if (storedJobs) {
        setJobs(JSON.parse(storedJobs));
      }
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // --- FUNZIONE PER SPOSTARE LO STATO ---
  const updateStatus = (e: React.MouseEvent, jobId: string, newStatus: string) => {
    e.preventDefault(); // Evita che il click apra il Link del dettaglio
    
    // Aggiorna lo stato locale
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    );
    
    setJobs(updatedJobs);
    // Aggiorna il LocalStorage
    localStorage.setItem("workshopJobs", JSON.stringify(updatedJobs));
  };

  const columns = [
    { id: "todo", title: "Da Fare", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    { id: "progress", title: "In Lavorazione", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { id: "done", title: "Completato", color: "bg-green-500/10 text-green-400 border-green-500/20" }
  ];

  const getJobsByStatus = (status: string) => jobs.filter(job => job.status === status);

  if (!isLoaded) return <div className="p-6 text-slate-400">Caricamento lavagna...</div>;

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Officina</h2>
          <p className="text-slate-400">Gestione operativa lavori</p>
        </div>
        
        <div className="flex gap-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
            </button>
            <Link 
              href="/admin/officina/new"
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-orange-900/20"
            >
              <Plus className="w-4 h-4" />
              Nuovo Lavoro
            </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col max-h-full">
              {/* Column Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-200">{col.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${col.color}`}>
                    {getJobsByStatus(col.id).length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {getJobsByStatus(col.id).length === 0 ? (
                   <div className="text-sm text-slate-600 text-center italic mt-10 border-2 border-dashed border-slate-800 rounded-lg p-6">
                      Nessun lavoro
                   </div>
                ) : (
                  getJobsByStatus(col.id).map((job) => (
                    
                    /* CARD */
                    <Link 
                      href={`/admin/officina/${job.id}`} 
                      key={job.id}
                      className="block bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all group relative"
                    >
                      {/* Badge Tipo e Data */}
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded uppercase">
                          {job.type === 'tire_change' ? 'Gomme' : job.type}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                           <Calendar className="w-3 h-3" />
                           {new Date(job.createdAt).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                        {job.vehicle}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3 font-mono bg-slate-900/50 inline-block px-1 rounded">
                        {job.plate}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-slate-300 border-t border-slate-700 pt-3 mb-3">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{job.customer}</span>
                      </div>

                      {/* --- PULSANTI AZIONE RAPIDA (MOVIMENTO) --- */}
                      <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-slate-700/50">
                        {/* Se non è il primo step, mostra freccia sinistra */}
                        {job.status !== 'todo' ? (
                            <button 
                                onClick={(e) => updateStatus(e, job.id, job.status === 'done' ? 'progress' : 'todo')}
                                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                title="Torna indietro"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        ) : <div></div>}

                        {/* Se non è l'ultimo step, mostra freccia destra */}
                        {job.status !== 'done' ? (
                            <button 
                                onClick={(e) => updateStatus(e, job.id, job.status === 'todo' ? 'progress' : 'done')}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 hover:bg-orange-600 text-xs text-white transition-colors"
                            >
                                {job.status === 'todo' ? 'Inizia' : 'Completa'}
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                                <CheckCircle className="w-3 h-3" /> Finito
                            </span>
                        )}
                      </div>

                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}