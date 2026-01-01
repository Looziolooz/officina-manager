"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface Props {
  income: number;
  expenses: number;
}

export default function FinancialCharts({ income, expenses }: Props) {
  // Dati preparati per il grafico
  const data = [
    { name: 'Entrate', value: income, fill: '#34d399' }, // Emerald-400
    { name: 'Uscite', value: expenses, fill: '#f87171' }, // Red-400
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8" 
          tick={{ fill: '#94a3b8' }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: number) => [`€ ${value.toFixed(2)}`, 'Importo']}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
}