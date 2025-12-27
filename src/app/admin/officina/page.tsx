import { prisma } from "@/lib/prisma";
import Link from "next/link";
import KanbanClient from "./KanbanClient"; // Import corretto
import { JobWithDetails } from "@/lib/types";

export default async function OfficinaPage() {
  const jobs = await prisma.job.findMany({
    where: { NOT: { status: "ARCHIVIATO" } },
    include: {
      vehicle: { include: { customer: true } },
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as JobWithDetails[];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase text-slate-900">Gestione Officina</h1>
        <Link href="/admin/officina/new" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase">
          + Nuovo Ingresso
        </Link>
      </div>
      <KanbanClient initialJobs={jobs} />
    </div>
  );
}