import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, FileText, AlertCircle } from "lucide-react";
import FinancialCharts from "@/components/accounting/FinancialCharts";
import InvoiceList from "@/components/accounting/InvoiceList";

export default async function AccountingPage() {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  // 1. Recupero Dati Aggregati
  const [income, expenses, overdueInvoices] = await Promise.all([
    prisma.accountingRecord.aggregate({
      where: { type: 'INCOME', date: { gte: startOfYear } },
      _sum: { totalAmount: true }
    }),
    prisma.accountingRecord.aggregate({
      where: { type: 'EXPENSE', date: { gte: startOfYear } },
      _sum: { totalAmount: true }
    }),
    prisma.invoice.findMany({
      where: { status: 'OVERDUE' },
      include: { customer: true, items: true }, 
      take: 5
    })
  ]);

  const totalIncome = income._sum.totalAmount || 0;
  const totalExpenses = expenses._sum.totalAmount || 0;
  const netMargin = totalIncome - totalExpenses;

  // Recupero Fatture Recenti
  const recentInvoices = await prisma.invoice.findMany({
    orderBy: { issueDate: 'desc' },
    take: 10,
    include: { customer: true, items: true } 
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Contabilità</h1>
          <p className="text-gray-400 text-sm">Panoramica finanziaria {currentYear}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/accounting/expenses/new" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-all">
            Registra Spesa
          </Link>
            <Link 
              href="/admin/accounting/invoices/new" 
              className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20"
            >
              <Plus size={20} /> Nuova Fattura
            </Link>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={100} /></div>
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Fatturato Annuo</p>
          <h2 className="text-3xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalIncome)}
          </h2>
        </div>

        <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown size={100} /></div>
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Spese Totali</p>
          <h2 className="text-3xl font-bold text-red-400 font-mono">
            {formatCurrency(totalExpenses)}
          </h2>
        </div>

        <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={100} /></div>
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Utile Netto</p>
          <h2 className={`text-3xl font-bold font-mono ${netMargin >= 0 ? 'text-white' : 'text-red-500'}`}>
            {formatCurrency(netMargin)}
          </h2>
        </div>
      </div>

      {/* ALERT SCADENZE */}
      {overdueInvoices.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <AlertCircle size={18} /> Fatture Scadute
          </h3>
          <div className="space-y-2">
            {overdueInvoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center text-sm text-white bg-red-500/5 p-2 rounded-lg">
                <span>FT-{inv.invoiceNumber} - {inv.customer.lastName}</span>
                <span className="font-mono font-bold">{formatCurrency(inv.amountDue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENUTO TABELLARE + GRAFICI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista Fatture */}
        <div className="lg:col-span-2">
          {/* FIX: Usato @ts-expect-error invece di @ts-ignore come richiesto da ESLint */}
          <InvoiceList invoices={recentInvoices} />
        </div>
        
        {/* Grafico */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 h-100">
          <h3 className="text-white font-bold mb-4">Andamento Annuale</h3>
          <FinancialCharts income={totalIncome} expenses={totalExpenses} />
        </div>
      </div>
    </div>
  );
}