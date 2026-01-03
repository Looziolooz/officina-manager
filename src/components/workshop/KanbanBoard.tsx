"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Job, JobStatus } from "@prisma/client";
import { updateJobStatus } from "@/app/actions/workshop";
import { createPortal } from "react-dom";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Calendar, Car, User } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Definiamo un tipo esteso per il Job che includa le relazioni
type JobWithDetails = Job & {
  customer: { lastName: string };
  vehicle: { plate: string; model: string; brand: string };
};

interface KanbanBoardProps {
  initialJobs: JobWithDetails[];
}

const COLUMNS: { id: JobStatus; title: string }[] = [
  { id: "SCHEDULED", title: "Programmati" },
  { id: "WAITING_PARTS", title: "Attesa Ricambi" },
  { id: "IN_PROGRESS", title: "In Lavorazione" },
  { id: "COMPLETED", title: "Completati" },
];

export default function KanbanBoard({ initialJobs }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<JobWithDetails[]>(initialJobs);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Previene drag accidentali al click
      },
    })
  );

  const activeJob = jobs.find((job) => job.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const jobId = active.id as string;
    const newStatus = over.id as JobStatus;
    const currentJob = jobs.find((j) => j.id === jobId);
    
    if (!currentJob || currentJob.status === newStatus) {
      setActiveId(null);
      return;
    }

    const originalStatus = currentJob.status;

    // 1. Aggiornamento Ottimistico
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    setActiveId(null);

    // 2. Chiamata al Server
    const result = await updateJobStatus(jobId, newStatus);

    // 3. Rollback in caso di errore
    if (!result.success) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: originalStatus } : job
        )
      );
      // FIX: Usiamo 'message' invece di 'error'
      console.error("Errore aggiornamento stato:", result.message);
      alert(`Errore: ${result.message}`);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          // FIX: min-w-[280px] -> min-w-70 (Canonical class suggerita da Tailwind)
          <div key={col.id} className="flex flex-col h-full min-w-70">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getStatusColor(col.id)}`}></span>
                {col.title}
              </h3>
              <span className="bg-white/10 text-gray-400 text-xs px-2 py-1 rounded-full">
                {jobs.filter((j) => j.status === col.id).length}
              </span>
            </div>

            {/* Droppable Area */}
            <KanbanColumn 
              id={col.id} 
              jobs={jobs.filter((j) => j.status === col.id)} 
            />
          </div>
        ))}
      </div>

      {typeof window !== "undefined" && createPortal(
        <DragOverlay>
          {activeJob ? <JobCard job={activeJob} isOverlay /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

// --- SOTTO-COMPONENTI ---

import { useDroppable } from "@dnd-kit/core";

function KanbanColumn({ id, jobs }: { id: string; jobs: JobWithDetails[] }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      // FIX: min-h-[500px] -> min-h-125 (Canonical class suggerita da Tailwind)
      className="bg-slate-900/30 border border-white/5 rounded-2xl p-3 min-h-125 flex-1 flex flex-col gap-3 transition-colors hover:bg-slate-900/40"
    >
      {jobs.map((job) => (
        <DraggableJobCard key={job.id} job={job} />
      ))}
      {jobs.length === 0 && (
        <div className="text-center text-gray-600 text-sm py-10 italic">
          Nessun lavoro
        </div>
      )}
    </div>
  );
}

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableJobCard({ job }: { job: JobWithDetails }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <JobCard job={job} />
    </div>
  );
}

function JobCard({ job, isOverlay }: { job: JobWithDetails; isOverlay?: boolean }) {
  return (
    <div
      className={`bg-slate-800 p-4 rounded-xl border border-white/10 shadow-lg cursor-grab active:cursor-grabbing group relative overflow-hidden ${
        isOverlay ? "rotate-2 scale-105 border-primary shadow-xl z-50" : "hover:border-white/20"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono text-gray-500">{job.jobNumber}</span>
        <StatusBadge status={job.status} />
      </div>

      <Link 
        href={`/admin/workshop/${job.id}`} 
        className="block font-bold text-white mb-3 hover:text-primary transition-colors line-clamp-1"
      >
        {job.title}
      </Link>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Car size={14} className="text-blue-400" />
          <span className="truncate">
            {job.vehicle.brand} {job.vehicle.model}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} className="text-green-400" />
          <span className="truncate">{job.customer.lastName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-white/5">
          <Calendar size={12} />
          {format(new Date(job.scheduledDate), "d MMM", { locale: it })}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "SCHEDULED": return "bg-blue-500";
    case "IN_PROGRESS": return "bg-orange-500";
    case "WAITING_PARTS": return "bg-amber-500";
    case "COMPLETED": return "bg-green-500";
    default: return "bg-gray-500";
  }
}