"use client";

import { useEffect, useState } from "react";
import { getAccountingData } from "@/app/actions/accounting";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BadgeEuro, TrendingUp, Wrench, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type AccountingData = {
  kpi: {
    revenue: number;
    expenses: number;
    margin: number;
    labor: number;
    jobsCount: number;
  };
  chartData: Array<{
    name: string;
    fatturato: number;
    utile: number;
  }>;
};

export default function ContabilitaPage() {
  const [data, setData] = useState<AccountingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await getAccountingData();
      if (result.success && result.data) {
        setData(result.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-white">Nessun dato disponibile.</div>;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BadgeEuro className="text-orange-500 w-8 h-8" />
          Contabilità & Report
        </h1>
        <p className="text-slate-400">Analisi finanziaria dell&apos;anno corrente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm text-slate-400 mb-1">Fatturato Totale</p>
            <h3 className="text-3xl font-bold text-white">€ {data.kpi.revenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</h3>
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-600/20 to-transparent"></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-sm text-slate-400 mb-1">Utile Netto (Stima)</p>
          <h3 className="text-3xl font-bold text-green-400">€ {data.kpi.margin.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</h3>
          <p className="text-xs text-slate-500 mt-2">Ricavi - Costo acquisto ricambi</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Manodopera</p>
              <h3 className="text-2xl font-bold text-blue-400">€ {data.kpi.labor.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</h3>
            </div>
            <Wrench className="text-blue-500/20 w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Lavori Chiusi</p>
              <h3 className="text-2xl font-bold text-purple-400">{data.kpi.jobsCount}</h3>
            </div>
            <TrendingUp className="text-purple-500/20 w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 p-6 rounded-xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">Andamento Mensile</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `€${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  // [!code warning] Usiamo un tipo unione sicuro invece di 'any'
                  formatter={(value: number | string | Array<number | string> | undefined) => [`€ ${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="fatturato" name="Fatturato" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utile" name="Utile" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 p-6 rounded-xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">Trend Cumulative</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorFatturato" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                />
                <Area type="monotone" dataKey="fatturato" stroke="#f97316" fillOpacity={1} fill="url(#colorFatturato)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-400 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Trend Fatturato
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Trend Utile
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}