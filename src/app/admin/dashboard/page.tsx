// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Car, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getDashboardStats } from "@/app/actions/dashboard";

interface DashboardData {
  monthlyRevenue: number;
  carsInWorkshop: number;
  lowStockParts: number;
  completedJobsCount: number;
  chartData: Array<{ name: string; fatturato: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const res = await getDashboardStats();
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-white">Nessun dato disponibile</div>;

  const stats = [
    {
      title: "Fatturato Mese",
      value: `€ ${data.monthlyRevenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`,
      change: "Mese corrente",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Auto sul Ponte",
      value: data.carsInWorkshop,
      change: "In lavorazione ora",
      icon: Car,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Scorte Basse",
      value: data.lowStockParts,
      change: "Sotto soglia minima",
      icon: AlertTriangle,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      title: "Lavori Chiusi",
      value: data.completedJobsCount,
      change: "Questo mese",
      icon: CheckCircle2,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Panoramica</h2>
        <p className="text-slate-400">Benvenuto, ecco la situazione aggiornata in tempo reale.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              <span className={stat.color === "text-green-500" ? "text-green-400" : "text-slate-400"}>
                {stat.change}
              </span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900 border border-slate-800 p-6 rounded-xl"
      >
        <h3 className="text-xl font-bold text-white mb-6">Fatturato Ultimi 7 Giorni</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `€${value}`} />
              <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.2 }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number | string | Array<number | string> | undefined) => [
                  `€ ${Number(value || 0).toLocaleString()}`, 
                  'Fatturato'
                ]}
              />
              <Bar 
                dataKey="fatturato" 
                fill="#f97316" 
                radius={[4, 4, 0, 0]} 
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}