"use client";
import { Trophy, Users } from "lucide-react";

type TopPart = {
  id: string;
  name: string;
  code: string;
  category: string;
  revenue: number;
};

type TopCustomer = {
  id: string;
  name: string;
  totalSpent: number;
  invoiceCount: number;
};

export function TopPartsWidget({ parts }: { parts: TopPart[] }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Top Ricambi</h3>
      </div>
      <div className="space-y-4">
        {parts.map((p, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold text-yellow-500 w-4">#{i+1}</span>
              <div>
                <p className="text-white font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.code}</p>
              </div>
            </div>
            <span className="text-green-400 font-mono font-bold">€{p.revenue.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopCustomersWidget({ customers }: { customers: TopCustomer[] }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-blue-400" />
        <h3 className="text-lg font-bold text-white">Top Clienti</h3>
      </div>
      <div className="space-y-4">
        {customers.map((c, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs border border-white/10">
                {c.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">{c.invoiceCount} fatture</p>
              </div>
            </div>
            <span className="text-emerald-400 font-mono font-bold">€{c.totalSpent.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}