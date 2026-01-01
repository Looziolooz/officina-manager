import { prisma } from "@/lib/db";
import JobCreateForm from "@/components/workshop/JobCreateForm";

export default async function NewJobPage() {
  // Carichiamo i veicoli per popolare la select
  // In produzione potresti voler caricare solo gli ultimi 100 o usare una ricerca async
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100, 
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Nuovo Intervento</h1>
      <JobCreateForm vehicles={vehicles} />
    </div>
  );
}