"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface FinancialChartsProps {
  data: {
    name: string;
    value: number;
  }[];
}

export default function FinancialCharts({ data }: FinancialChartsProps) {
  return (
    // FIX: Aggiornato h-[300px] a h-75 come suggerito da Tailwind
    <div className="h-75 w-full bg-slate-900/50 border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Andamento Mensile</h3>
      
      {/* FIX: Aggiornato h-[250px] a h-62.5 come suggerito da Tailwind */}
      <div className="h-62.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              cursor={{ fill: '#334155', opacity: 0.2 }}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              // FIX CRITICO: Risolve l'errore di build TypeScript gestendo il tipo 'any'
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`€ ${Number(value).toFixed(2)}`, 'Importo']}
            />
            <Bar 
              dataKey="value" 
              fill="#f97316" 
              radius={[4, 4, 0, 0]} 
              barSize={40} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}