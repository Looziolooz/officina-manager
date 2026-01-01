import { JobStatus } from "@prisma/client";

const statusStyles: Record<JobStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
  WAITING_PARTS: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  DELIVERED: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels: Record<JobStatus, string> = {
  SCHEDULED: "Schedulato",
  IN_PROGRESS: "In Lavorazione",
  WAITING_PARTS: "Attesa Ricambi",
  COMPLETED: "Completato",
  DELIVERED: "Consegnato",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}