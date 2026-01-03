import { JobStatus } from "@prisma/client";

// Mappatura stili per ogni stato
const statusStyles: Record<JobStatus, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  WAITING_PARTS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
  DELIVERED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  // NUOVI STATI AGGIUNTI
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  PENDING: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// Mappatura etichette per la visualizzazione
const statusLabels: Record<JobStatus, string> = {
  SCHEDULED: "Programmato",
  IN_PROGRESS: "In Lavorazione",
  WAITING_PARTS: "Attesa Ricambi",
  COMPLETED: "Completato",
  DELIVERED: "Consegnato",
  CANCELLED: "Annullato",
  PENDING: "In Attesa",
};

interface StatusBadgeProps {
  status: JobStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        statusStyles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}