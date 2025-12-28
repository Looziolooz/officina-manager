"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, Line 
} from "recharts";

// Definiamo l'interfaccia per i dati del grafico per evitare 'any'
interface DashboardData {
  chartData: {
    name: string;
    fatturato: number;
    margine: number;
  }[];
  topParts: {
    name: string;
    qty: number | null;
  }[];
}

export default function DashboardCharts({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Grafico Andamento Economico */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="font-black uppercase text-xs tracking-widest mb-6 italic text-slate-400">
          Andamento Fatturato e Margine
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="colorFatturato" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="fatturato" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFatturato)" strokeWidth={3} name="Fatturato (€)" />
              <Line type="monotone" dataKey="margine" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Margine (€)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafico Ricambi più usati */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="font-black uppercase text-xs tracking-widest mb-6 italic text-slate-400">
          Top 5 Ricambi Utilizzati (Quantità)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topParts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              />
              <Bar dataKey="qty" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} name="Quantità" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}