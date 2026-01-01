"use client";

import { useState } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  useSensor, 
  useSensors, 
  PointerSensor 
} from '@dnd-kit/core';
import { Job, JobStatus, Vehicle, User } from "@prisma/client"; 
import { updateJobStatus } from "@/app/actions/workshop";
import { JobCard } from "./JobCard";
import { KanbanColumn } from "./KanbanColumn";

type JobWithRelations = Job & {
  vehicle: Vehicle;
  assignedTo: User | null;
};

interface Props {
  initialJobs: JobWithRelations[];
}

const COLUMNS: JobStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED'];

export default function KanbanBoard({ initialJobs }: Props) {
  const [jobs, setJobs] = useState<JobWithRelations[]>(initialJobs);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const jobId = active.id as string;
    // Nota: dnd-kit a volte restituisce l'id del container sortable, a volte l'id dell'elemento
    const overId = over.id;
    const overContainerId = over.data.current?.sortable?.containerId || overId;

    // Se stiamo droppando sopra una colonna o una card in quella colonna
    if (COLUMNS.includes(overContainerId as JobStatus)) {
      const newStatus = overContainerId as JobStatus;
      
      const currentJob = jobs.find(j => j.id === jobId);
      if (currentJob && currentJob.status !== newStatus) {
        
        // 1. Update Ottimistico UI
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ));

        // 2. Server Action
        const result = await updateJobStatus(jobId, newStatus);
        
        if (!result.success) {
          // Revert in caso di errore
          setJobs(prev => prev.map(job => 
            job.id === jobId ? { ...job, status: currentJob.status } : job
          ));
          console.error("Errore aggiornamento stato", result.error);
        }
      }
    }
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      {/* Aumentato gap-4 a gap-6 per più respiro */}
      <div className="flex gap-6 h-full overflow-x-auto pb-4 px-2 snap-x">
        {COLUMNS.map(status => (
          <KanbanColumn 
            key={status} 
            status={status} 
            jobs={jobs.filter(j => j.status === status)} 
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <JobCard job={jobs.find(j => j.id === activeId)!} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}