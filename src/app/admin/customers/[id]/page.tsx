import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: { include: { jobs: true } }
    }
  });

  if (!customer) notFound();

  const allJobs = customer.vehicles.flatMap((v: typeof customer.vehicles[number]) => v.jobs);
  const totalSpent = allJobs.reduce((sum: number, job: typeof allJobs[number]) => sum + (job.totalAmount || 0), 0);

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-xl border border-white/10">
        <div>
          <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
          <p className="text-gray-400">{customer.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase font-bold">Fatturato Totale</p>
          <p className="text-3xl font-bold text-green-400">€ {totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customer.vehicles.map((vehicle: typeof customer.vehicles[number]) => (
          <div key={vehicle.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-lg font-bold uppercase">{vehicle.plate}</p>
            <p className="text-sm text-gray-400">{vehicle.brand} {vehicle.model}</p>
          </div>
        ))}
      </div>
    </div>
  );
}