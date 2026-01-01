import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { Invoice, Customer, InvoiceItem } from '@prisma/client';

// Definiamo un tipo esteso per evitare 'any'
type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
};

export const generateInvoicePDF = (invoice: InvoiceWithRelations) => {
  const doc = new jsPDF();
  
  // Header Azienda
  doc.setFontSize(22);
  doc.text("OFFICINA GT SERVICE", 20, 20);
  doc.setFontSize(10);
  doc.text("Via Roma 1, Milano (MI) - P.IVA 12345678901", 20, 26);
  
  // Dati Fattura
  doc.setFontSize(16);
  doc.text(`FATTURA N. ${invoice.invoiceNumber}`, 140, 20);
  doc.setFontSize(10);
  doc.text(`Data: ${format(new Date(invoice.issueDate), 'dd/MM/yyyy')}`, 140, 26);
  
  // Dati Cliente
  doc.text("CLIENTE:", 20, 50);
  doc.setFontSize(12);
  const customerName = invoice.customer.companyName || `${invoice.customer.firstName} ${invoice.customer.lastName}`;
  doc.text(customerName, 20, 56);
  doc.setFontSize(10);
  doc.text(invoice.customer.address || "", 20, 61);
  doc.text(`P.IVA: ${invoice.customer.vatNumber || "-"}`, 20, 66);
  // Gestione opzionale sdiCode se presente nel modello, altrimenti stringa vuota
  // @ts-ignore - ignora se sdiCode non è ancora nel tipo generato
  doc.text(`Cod. SDI: ${invoice.customer.sdiCode || "0000000"}`, 20, 71);

  // Tabella semplice
  let y = 90;
  doc.line(20, y, 190, y);
  y += 5;
  doc.setFont(undefined, 'bold');
  doc.text("Descrizione", 20, y);
  doc.text("Qta", 110, y);
  doc.text("Prezzo", 130, y);
  doc.text("Totale", 160, y);
  doc.setFont(undefined, 'normal');
  y += 5;
  doc.line(20, y, 190, y);
  y += 10;

  invoice.items.forEach((item) => {
    doc.text(item.description, 20, y);
    doc.text(String(item.quantity), 110, y);
    doc.text(`€ ${item.unitPrice.toFixed(2)}`, 130, y);
    doc.text(`€ ${item.subtotal.toFixed(2)}`, 160, y);
    y += 7;
  });

  // Totali
  y += 10;
  doc.line(130, y, 190, y);
  y += 7;
  doc.text(`Imponibile: € ${invoice.subtotal.toFixed(2)}`, 130, y);
  y += 5;
  doc.text(`IVA (22%): € ${invoice.taxAmount.toFixed(2)}`, 130, y);
  y += 7;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTALE: € ${invoice.total.toFixed(2)}`, 130, y);

  doc.save(`Fattura_${invoice.invoiceNumber}.pdf`);
};