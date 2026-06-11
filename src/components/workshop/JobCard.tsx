"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Job, Vehicle, User } from "@prisma/client";
import { User as UserIcon, Archive, AlertTriangle, Clock } from "lucide-react";
import { updateJobStatus } from "@/app/actions/workshop";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

type JobWithRelations = Job & { vehicle: Vehicle; assignedTo: User | null };

interface Props {
  job: JobWithRelations;
  isOverlay?: boolean;
}

export function JobCard({ job, isOverlay }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: job.id, data: { type: 'Job', job } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Vuoi archiviare questo lavoro come Consegnato? Sparirà dalla Kanban board.")) {
      await updateJobStatus(job.id, "DELIVERED");
    }
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-48 rounded-2xl border-2 border-dashed border-blue-500/50 bg-blue-500/10 backdrop-blur-sm"
      />
    );
  }

  // Configurazione colori in base alla priorità
  const priorityConfig = [
    { border: "border-l-emerald-500", bg: "from-emerald-500/5", text: "text-success", label: null }, // 0 Normal
    { border: "border-l-amber-500", bg: "from-amber-500/5", text: "text-warning", label: "Alta" },   // 1 High
    { border: "border-l-red-600", bg: "from-red-600/5", text: "text-red-400", label: "Critica", icon: AlertTriangle }   // 2 Critical
  ][job.priority ?? 0] || { border: "border-l-slate-500", bg: "", text: "", label: null };

  const PriorityIcon = priorityConfig.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // FIX: Corretta sintassi Tailwind v4: 'bg-background!' invece di '!bg-background'
      className={`
        relative bg-linear-to-br ${priorityConfig.bg} to-transparent bg-surface/80 border border-border 
        p-4 rounded-2xl shadow-md hover:shadow-lg hover:border-border hover:-translate-y-0.5
        transition-all duration-200 cursor-grab active:cursor-grabbing group border-l-[6px]
        ${priorityConfig.border}
        ${isOverlay ? 'scale-105 shadow-2xl rotate-2 ring-1 ring-white/30 z-50 bg-background!' : ''}
      `}
    >
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-foreground bg-background px-2.5 py-1 rounded-lg text-xs border border-border">
            {job.vehicle.plate}
          </span>
          {priorityConfig.label && (
             <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${priorityConfig.text} bg-background px-2 py-0.5 rounded-full`}>
               {PriorityIcon && <PriorityIcon size={10} />} {priorityConfig.label}
             </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground opacity-70">#{job.jobNumber.split('-')[2]}</span>
      </div>

      {/* --- BODY --- */}
      <div className="mb-4">
        <h3 className="font-bold text-base mb-1 text-foreground line-clamp-2 leading-tight" title={job.title}>
          {job.title}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          {job.vehicle.brand} {job.vehicle.modelName}
        </p>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex items-end justify-between pt-3 border-t border-border">
        {/* Assegnatario & Data */}
        <div className="flex items-center gap-2">
          {job.assignedTo ? (
             <div className="relative" title={`Assegnato a: ${job.assignedTo.name}`}>
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-foreground flex items-center justify-center text-xs font-bold shadow-sm border border-border">
                  {job.assignedTo.name.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
             </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-background border border-border text-muted-foreground flex items-center justify-center" title="Non assegnato">
              <UserIcon size={14} />
            </div>
          )}
          <div className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
            <Clock size={10} />
            {formatDistanceToNow(new Date(job.updatedAt ?? Date.now()), { locale: it, addSuffix: false })} fa
          </div>
        </div>
        
        {/* Totali Finanziari */}
        <div className="text-right">
          {(job.totalAmount ?? 0) > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase">Totale</span>
              <span className="text-sm font-bold text-success font-mono leading-none">
                €{(job.totalAmount ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pulsante Archiviazione */}
      {job.status === 'COMPLETED' && !isOverlay && (
        <button
          onClick={handleArchive}
          className="absolute -top-2 -right-2 bg-emerald-600 hover:bg-emerald-500 text-foreground p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110"
          title="Consegna e Archivia"
        >
          <Archive size={16} />
        </button>
      )}
    </div>
  );
}