"use client";

import { Invoice, Customer } from "@prisma/client";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdfGenerator";

// Definiamo un tipo che estende Invoice per includere Customer
type InvoiceWithCustomer = Invoice & {
  customer: Customer;
  items: any[]; // Aggiunto per compatibilità PDF
};

interface Props {
  invoices: InvoiceWithCustomer[];
}

export default function InvoiceList({ invoices }: Props) {
  
  // Funzione wrapper per scaricare il PDF
  const handleDownload = (invoice: InvoiceWithCustomer) => {
    // Il generatore PDF si aspetta items, assicurati che la query Prisma li includa
    // Se nel server component non hai incluso 'items', qui fallirà o sarà vuoto.
    // Per ora passiamo l'oggetto così com'è, assumendo che nel server component tu aggiunga: include: { items: true }
    generateInvoicePDF(invoice);
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-white font-bold flex items-center gap-2">
          <FileText className="text-slate-400" /> Ultime Fatture
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-black/20 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="p-4">Numero</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Data</th>
              <th className="p-4 text-right">Importo</th>
              <th className="p-4 text-center">Stato</th>
              <th className="p-4 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-white">{inv.invoiceNumber}</td>
                <td className="p-4">
                  {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                </td>
                <td className="p-4">{format(new Date(inv.issueDate), 'dd/MM/yyyy')}</td>
                <td className="p-4 text-right font-bold text-white">
                  {formatCurrency(inv.total)}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                    ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 
                      inv.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400' : 
                      'bg-blue-500/10 text-blue-400'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleDownload(inv)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                    title="Scarica PDF"
                  >
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}