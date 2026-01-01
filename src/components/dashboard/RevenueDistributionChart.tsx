"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export function RevenueDistributionChart({ laborRevenue, partsRevenue }: { laborRevenue: number, partsRevenue: number }) {
  const data = [
    { name: "Manodopera", value: laborRevenue, color: "#3b82f6" },
    { name: "Ricambi", value: partsRevenue, color: "#ea580c" },
  ];

  return (
    <div className="rounded-2xl bg-slate-900 border border-white/10 p-6 h-full">
      <h3 className="text-lg font-bold text-white mb-6">Distribuzione Entrate</h3>
      <div className="h-75">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}