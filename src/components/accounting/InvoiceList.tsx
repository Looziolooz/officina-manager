"use client";

import { Invoice, Customer, InvoiceItem, Vehicle, Job } from "@prisma/client";
import { format } from "date-fns";
import { generateInvoicePDF, PDFData } from "@/lib/pdfGenerator";
import { Download } from "lucide-react";

// Helper per formattare la valuta
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Estensione dei tipi Prisma
type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
  job?: (Job & {
    vehicle?: Vehicle;
  }) | null;
};

interface InvoiceListProps {
  invoices: InvoiceWithRelations[];
}

export default function InvoiceList({ invoices }: InvoiceListProps) {

  const handleDownload = (invoice: InvoiceWithRelations) => {
    // Calcoliamo il totale se il campo 'total' non esiste o per sicurezza
    // Assumiamo che nel DB il campo totale si chiami 'total' o lo calcoliamo
    // Guardando gli errori, sembra mancare 'totalAmount'. Usiamo una fallback sicura.
    const calculatedTotal = Number(invoice.subtotal) + Number(invoice.taxAmount);
    
    // FIX: Mappatura corretta dei dati per il PDF
    const pdfData: PDFData = {
      title: "FATTURA",
      // FIX: Convertiamo il numero in stringa
      number: invoice.number.toString(),
      // FIX: Usiamo createdAt perché 'date' non esiste nel modello
      date: new Date(invoice.createdAt),
      customer: {
        firstName: invoice.customer.firstName,
        lastName: invoice.customer.lastName,
        address: invoice.customer.address,
        phone: invoice.customer.phone,
        email: invoice.customer.email,
      },
      vehicle: invoice.job?.vehicle ? {
        brand: invoice.job.vehicle.brand,
        model: invoice.job.vehicle.model,
        plate: invoice.job.vehicle.plate,
        km: invoice.job.vehicle.totalKm,
      } : null,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        // FIX: Calcoliamo il totale riga perché 'totalPrice' non esiste nel DB
        total: Number(item.quantity) * Number(item.unitPrice),
      })),
      totals: {
        subtotal: Number(invoice.subtotal),
        tax: Number(invoice.taxAmount),
        // FIX: Usiamo il totale calcolato o un campo esistente (es. 'total') se presente, altrimenti la somma
        total: calculatedTotal, 
      },
    };

    generateInvoicePDF(pdfData);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/10">
        Nessuna fattura trovata
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-sm">
            <th className="p-4">Numero</th>
            <th className="p-4">Data</th>
            <th className="p-4">Cliente</th>
            <th className="p-4 text-right">Importo</th>
            <th className="p-4 text-center">Stato</th>
            <th className="p-4 text-right">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            // Calcolo totale per visualizzazione
            const displayTotal = Number(invoice.subtotal) + Number(invoice.taxAmount);
            
            return (
            <tr
              key={invoice.id}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="p-4 font-mono text-white">{invoice.number}</td>
              <td className="p-4 text-gray-300">
                {/* FIX: Usiamo createdAt */}
                {format(new Date(invoice.createdAt), "dd/MM/yyyy")}
              </td>
              <td className="p-4 text-gray-300">
                {invoice.customer.firstName} {invoice.customer.lastName}
              </td>
              <td className="p-4 text-right font-bold text-white">
                {formatCurrency(displayTotal)}
              </td>
              <td className="p-4 text-center">
                {/* FIX: Logica stati aggiornata con i valori reali dell'Enum Prisma */}
                <StatusBadge status={invoice.status} />
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={() => handleDownload(invoice)}
                  className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                  title="Scarica PDF"
                >
                  <Download size={18} />
                </button>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}

// Componente helper locale per gestire gli stati corretti
function StatusBadge({ status }: { status: string }) {
  let styles = "bg-gray-500/20 text-gray-400";
  let label = status;

  switch (status) {
    case "DRAFT":
      styles = "bg-gray-500/20 text-gray-400";
      label = "Bozza";
      break;
    case "ISSUED":
    case "SENT":
      styles = "bg-amber-500/20 text-amber-400";
      label = "Emessa";
      break;
    case "PARTIALLY_PAID":
      styles = "bg-blue-500/20 text-blue-400";
      label = "Parz. Pagata";
      break;
    case "OVERDUE":
      styles = "bg-red-500/20 text-red-400";
      label = "Scaduta";
      break;
    case "CANCELLED":
      styles = "bg-red-900/20 text-red-500";
      label = "Annullata";
      break;
    // Caso fallback per PAID se venisse aggiunto in futuro
    case "PAID": 
      styles = "bg-green-500/20 text-green-400";
      label = "Pagata";
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}