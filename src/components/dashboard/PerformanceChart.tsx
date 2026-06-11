"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

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
  const isEmpty = data.every((item) => item.revenue === 0 && item.margin === 0);

  return (
    <div className="rounded-2xl bg-surface border border-border p-6 h-full">
      <h3 className="text-lg font-bold text-foreground mb-6">Performance Settimanale</h3>
      <div className="h-75">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-4">
            Nessun movimento registrato negli ultimi 7 giorni.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
              />
              <Line type="monotone" dataKey="fatturato" stroke="#ea580c" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="margine" stroke="#22c55e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}