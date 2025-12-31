import { prisma } from "@/lib/db";
import Link from "next/link";
import { Car, ArrowRight, Plus } from "lucide-react";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";
  const customers = await prisma.customer.findMany({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Anagrafica Clienti</h1>
        <Link href="/admin/customers/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} /> Nuovo
        </Link>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-white/10">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-white/2 transition-colors">
                <td className="p-4 font-medium text-white">{customer.firstName} {customer.lastName}</td>
                <td className="p-4 text-gray-400">{customer.phone}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {customer.vehicles.map((v) => (
                      <span key={v.id} className="flex items-center gap-1 bg-white/10 text-xs px-2 py-1 rounded text-gray-300">
                        <Car size={12} /> {v.plate}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/customers/${customer.id}`} className="text-blue-400 hover:text-blue-300">
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