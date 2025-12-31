import { prisma } from "@/lib/db";
import { Package, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { Prisma } from "@prisma/client";

type PartWithData = Prisma.PartGetPayload<{}>;

export default async function InventoryPage() {
  const parts = await prisma.part.findMany({
    orderBy: { stock: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Package className="text-blue-500" /> Magazzino
        </h1>
        <Link href="/admin/inventory/new" className="bg-blue-600 px-4 py-2 rounded-lg text-white font-bold flex items-center gap-2">
          <Plus size={20} /> Nuovo Articolo
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Ricambio</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Prezzo</th>
              <th className="p-4 text-right">Margine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {parts.map((part: PartWithData) => {
              const margin = part.sellPrice - part.buyPrice;
              return (
                <tr key={part.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{part.code}</p>
                    <p className="text-xs text-gray-500">{part.name}</p>
                  </td>
                  <td className={`p-4 font-mono ${part.stock <= part.minStock ? 'text-orange-500' : 'text-green-400'}`}>
                    {part.stock} {part.stock <= part.minStock && <AlertTriangle size={12} className="inline ml-1" />}
                  </td>
                  <td className="p-4 text-white">€ {part.sellPrice.toFixed(2)}</td>
                  <td className="p-4 text-blue-400 font-bold text-right font-mono">€ {margin.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}