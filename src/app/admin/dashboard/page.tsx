"use client";

import { motion } from "framer-motion";
import { DollarSign, Car, AlertTriangle, CheckCircle2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Dati finti per il grafico
const data = [
  { name: 'Lun', fatturato: 1200 },
  { name: 'Mar', fatturato: 2100 },
  { name: 'Mer', fatturato: 800 },
  { name: 'Gio', fatturato: 1600 },
  { name: 'Ven', fatturato: 2400 },
  { name: 'Sab', fatturato: 1000 },
];

const stats = [
  {
    title: "Fatturato Mensile",
    value: "€ 12.450",
    change: "+12%",
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    title: "Auto in Officina",
    value: "8",
    change: "In lavorazione",
    icon: Car,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Scorte in Esaurimento",
    value: "3",
    change: "Azione richiesta",
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    title: "Lavori Completati",
    value: "156",
    change: "Questo mese",
    icon: CheckCircle2,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400">Benvenuto, ecco la situazione di oggi.</p>
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
        <h3 className="text-xl font-bold text-white mb-6">Andamento Settimanale</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="fatturato" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}