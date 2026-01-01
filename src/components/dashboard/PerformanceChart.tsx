"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { it } from "date-fns/locale";

type ChartItem = {
  date: Date;
  revenue: number;
  margin: number;
};

export function PerformanceChart({ data }: { data: ChartItem[] }) {
  const chartData = data.map((item) => ({
    date: format(item.date, "EEE dd", { locale: it }),
    fatturato: item.revenue,
    margine: item.margin,
  }));

  return (
    <div className="rounded-2xl bg-slate-900 border border-white/10 p-6 h-full">
      <h3 className="text-lg font-bold text-white mb-6">Performance Settimanale</h3>
      <div className="h-75">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `€${v}`} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
            <Line type="monotone" dataKey="fatturato" stroke="#ea580c" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="margine" stroke="#22c55e" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}