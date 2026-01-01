"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Job, Vehicle, User, JobStatus } from "@prisma/client";
import { JobCard } from "./JobCard";
import { CalendarDays, Wrench, Clock, CheckCircle2 } from "lucide-react";
import React from "react";

type JobWithRelations = Job & {
  vehicle: Vehicle;
  assignedTo: User | null;
};

interface Props {
  status: JobStatus;
  jobs: JobWithRelations[];
}

// FIX: Definito tipo esplicito per l'icona invece di 'any'
type ColumnConfig = {
  label: string;
  icon: React.ElementType; // Tipo corretto per componenti React/Lucide
  color: string;
  bg: string;
  border: string;
};

const columnConfig: Record<JobStatus, ColumnConfig> = {
  SCHEDULED: { 
    label: "Schedulati", 
    icon: CalendarDays, 
    color: "text-blue-400", 
    bg: "bg-blue-400/10",
    border: "border-blue-400/20"
  },
  IN_PROGRESS: { 
    label: "In Lavorazione", 
    icon: Wrench, 
    color: "text-orange-400", 
    bg: "bg-orange-400/10",
    border: "border-orange-400/20"
  },
  WAITING_PARTS: { 
    label: "Attesa Ricambi", 
    icon: Clock, 
    color: "text-purple-400", 
    bg: "bg-purple-400/10",
    border: "border-purple-400/20"
  },
  COMPLETED: { 
    label: "Pronti / Completati", 
    icon: CheckCircle2, 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20"
  },
  DELIVERED: { 
    label: "Archiviati", 
    icon: CheckCircle2, 
    color: "text-gray-400", 
    bg: "", 
    border: "" 
  }
};

export function KanbanColumn({ status, jobs }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = columnConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col w-80 shrink-0 h-full">
      {/* Header Colonna */}
      <div className={`flex items-center justify-between mb-3 p-3 rounded-xl ${config.bg} ${config.border} border backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <Icon size={16} className={config.color} />
          <h3 className={`font-bold uppercase text-xs tracking-wider ${config.color}`}>
            {config.label}
          </h3>
        </div>
        <span className="bg-slate-900/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
          {jobs.length}
        </span>
      </div>

      {/* Area Droppable */}
      <div 
        ref={setNodeRef} 
        className={`flex-1 rounded-2xl p-2 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent border transition-colors ${isOver ? 'bg-white/5 border-primary/30' : 'bg-slate-900/20 border-white/5'}`}
      >
        <SortableContext 
          id={status} 
          items={jobs.map(j => j.id)} 
          strategy={verticalListSortingStrategy}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </SortableContext>
        
        {jobs.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-xs italic border-2 border-dashed border-white/5 rounded-xl m-1 gap-2 opacity-70">
            <Icon size={24} className="opacity-50" />
            <span>Nessun lavoro qui</span>
          </div>
        )}
      </div>
    </div>
  );
}