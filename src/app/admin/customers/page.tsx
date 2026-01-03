import { prisma } from "@/lib/db";
import Link from "next/link";
import { User, Car, Plus, Phone, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import SearchInput from "@/components/ui/SearchInput";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query = "" } = await searchParams;

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
    take: 50,
  });

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">CRM Clienti</h1>
          <p className="text-gray-400 text-sm">Gestione anagrafica e storico</p>
        </div>
        <Link 
          href="/admin/customers/new" 
          className="bg-primary hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 cursor-pointer z-20 relative"
        >
          <Plus size={20} /> Nuovo Cliente
        </Link>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md sticky top-20 z-10">
        <SearchInput placeholder="Cerca per nome, targa o telefono..." defaultValue={query} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {customers.map((c) => (
          <Link 
            key={c.id} 
            href={`/admin/customers/${c.id}`}
            className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 p-6 rounded-2xl transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              {/* FIX: Aggiornato a bg-linear-to-br per Tailwind v4 */}
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10 text-gray-400 group-hover:text-primary transition-colors">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {c.firstName} {c.lastName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>
                  {c.lastVisit && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> 
                      {formatDistanceToNow(c.lastVisit, { addSuffix: true, locale: it })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <div className="flex gap-2 flex-wrap justify-end">
                {c.vehicles.map(v => (
                  <span key={v.id} className="bg-black/30 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono font-bold text-gray-300 flex items-center gap-2">
                    <Car size={12} className="text-primary" /> {v.plate}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-widest text-gray-500 block">Totale Speso</span>
                <span className="text-lg font-mono font-bold text-green-400">€ {(c.totalSpent || 0).toFixed(2)}</span>
              </div>
            </div>
          </Link>
        ))}
        {customers.length === 0 && (
          <div className="text-center py-20 text-gray-500">Nessun cliente trovato</div>
        )}
      </div>
    </div>
  );
}