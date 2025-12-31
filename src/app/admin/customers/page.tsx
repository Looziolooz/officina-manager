import { prisma } from "@/lib/db";
import Link from "next/link";
import { Car, ArrowRight, Plus } from "lucide-react";

async function getCustomers(query: string) {
  // Ora che le colonne esistono nel DB, questa query non fallirà più
  return await prisma.customer.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { vehicles: { some: { plate: { contains: query, mode: "insensitive" } } } },
      ],
    },
    include: { vehicles: true },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query = "" } = await searchParams;
  const customers = await getCustomers(query);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Anagrafica Clienti</h1>
        <Link href="/admin/customers/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} /> Nuovo Cliente
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-white/10">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 font-medium text-white">
                  {customer.firstName} {customer.lastName}
                </td>
                <td className="p-4 text-gray-400 font-mono text-sm">
                  {customer.phone}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {customer.vehicles.map((v) => (
                      <span key={v.id} className="flex items-center gap-1 bg-white/10 text-[10px] px-2 py-1 rounded text-gray-300 border border-white/5 uppercase">
                        <Car size={12} /> {v.plate}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/customers/${customer.id}`} className="text-blue-400 hover:text-blue-300 transition-colors inline-block">
                    <ArrowRight size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}