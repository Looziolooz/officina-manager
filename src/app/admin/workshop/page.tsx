import { prisma } from "@/lib/db";
import KanbanBoard from "@/components/workshop/KanbanBoard";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkshopPage() {
  // Recupera i lavori dal DB
  const jobs = await prisma.job.findMany({
    where: {
      status: { not: "CANCELLED" } // Opzionale: nascondiamo i cancellati dalla board
    },
    orderBy: { scheduledDate: "asc" },
    include: {
      vehicle: true,
      assignedTo: true,
      customer: true, // <--- FIX: Questa riga mancava e causava l'errore!
    },
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">Officina</h1>
          <p className="text-gray-400 text-sm">Gestione lavori e avanzamento</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/workshop/create"
            className="bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20"
          >
            <Plus size={20} />
            Nuovo Lavoro
          </Link>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-hidden pb-2">
        <KanbanBoard initialJobs={jobs} />
      </div>
    </div>
  );
}