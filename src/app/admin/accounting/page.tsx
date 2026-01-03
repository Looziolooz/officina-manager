import { prisma } from "@/lib/db";
import FinancialCharts from "@/components/accounting/FinancialCharts";
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Wallet } from "lucide-react";

// Funzione helper per formattare valuta
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

export default async function AccountingPage() {
  // 1. Calcolo Entrate (Somma fatture PAGATE)
  const incomeResult = await prisma.invoice.aggregate({
    where: { status: "PAID" },
    _sum: { total: true },
  });
  const totalIncome = incomeResult._sum.total || 0;

  // 2. Calcolo Uscite (Somma spese totali)
  const expenseResult = await prisma.expense.aggregate({
    _sum: { totalAmount: true },
  });
  const totalExpenses = expenseResult._sum.totalAmount || 0;

  // 3. Calcolo Utile Netto
  const netProfit = totalIncome - totalExpenses;

  // 4. Dati per il Grafico (FIX: Formattiamo come array per il componente)
  const chartData = [
    { name: "Entrate", value: totalIncome },
    { name: "Uscite", value: totalExpenses },
    { name: "Utile", value: Math.max(0, netProfit) }, // Mostriamo utile solo se positivo nel grafico
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">Contabilità</h1>
          <p className="text-gray-400 text-sm">Panoramica finanziaria dell&rsquoofficina</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entrate */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Entrate Totali</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <ArrowUpCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-green-400 mt-2">+ Fatture saldate</p>
        </div>

        {/* Uscite */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Spese Totali</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <ArrowDownCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-red-400 mt-2">- Spese registrate</p>
        </div>

        {/* Utile */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Utile Netto</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${netProfit >= 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
              <Wallet size={20} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-white' : 'text-orange-400'}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Margine operativo</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-1">
           {/* FIX: Passiamo la prop 'data' corretta invece di income/expenses separati */}
           <FinancialCharts data={chartData} />
        </div>
        
        {/* Placeholder per futuri dettagli o lista ultime transazioni */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Note Rapide</h3>
          <p className="text-gray-400 text-sm">
            Il calcolo delle entrate considera solo le fatture con stato <strong>PAGATO</strong>.
            Le fatture emesse ma non ancora saldate non vengono conteggiate nel flusso di cassa attuale.
          </p>
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
             <DollarSign className="text-blue-400 shrink-0" />
             <div className="text-sm text-gray-300">
               <span className="text-blue-400 font-bold block mb-1">Consiglio</span>
               Registra sempre le spese appena avvengono per avere un calcolo dell&rsquoutile preciso in tempo reale.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}