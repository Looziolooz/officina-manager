import jsPDF from "jspdf";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Definiamo un'interfaccia generica per i dati che passiamo al PDF
export interface PDFData {
  title: string;
  number: string;
  date: Date;
  customer: {
    firstName: string;
    lastName: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  vehicle?: {
    brand: string;
    model: string;
    plate: string;
    km?: number;
  } | null;
  items: {
    description: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

// FIX: Rinomina da generatePDF a generateInvoicePDF per combaciare con l'import
export const generateInvoicePDF = (data: PDFData) => {
  const doc = new jsPDF();
  
  // --- HEADER ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("OFFICINA MANAGER", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Via Roma 123, 00100 Roma (RM)", 20, 26);
  doc.text("P.IVA: 12345678901", 20, 30);
  doc.text("Tel: 06 12345678", 20, 34);

  // --- INFO DOCUMENTO ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.title, 140, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`N°: ${data.number}`, 140, 26);
  doc.text(`Data: ${format(new Date(data.date), "dd/MM/yyyy", { locale: it })}`, 140, 30);

  // --- CLIENTE ---
  let y = 50;
  doc.setDrawColor(200);
  doc.line(20, y, 190, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Cliente:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.customer.firstName} ${data.customer.lastName}`, 50, y);
  
  y += 5;
  if (data.customer.address) {
    doc.text(`Indirizzo: ${data.customer.address}`, 50, y);
    y += 5;
  }
  if (data.customer.phone) {
    doc.text(`Tel: ${data.customer.phone}`, 50, y);
    y += 5;
  }

  // --- VEICOLO (Se presente) ---
  if (data.vehicle) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Veicolo:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${data.vehicle.brand} ${data.vehicle.model} - Targa: ${data.vehicle.plate}`, 50, y);
    if (data.vehicle.km) {
        y += 5;
        doc.text(`Km: ${data.vehicle.km}`, 50, y);
    }
    y += 10;
  } else {
    y += 15;
  }

  // --- TABELLA ARTICOLI ---
  doc.line(20, y, 190, y);
  y += 5;
  
  doc.setFont("helvetica", "bold");
  
  doc.text("Descrizione", 20, y);
  doc.text("Q.tà", 110, y, { align: "center" });
  doc.text("Prezzo", 140, y, { align: "right" });
  doc.text("Totale", 190, y, { align: "right" });
  
  y += 3;
  doc.line(20, y, 190, y); // Linea sotto header tabella
  y += 5;

  doc.setFont("helvetica", "normal");

  data.items.forEach((item) => {
    // Gestione paginazione semplice
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const itemTotal = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(item.total);
    const itemPrice = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(item.price);

    // Tronca descrizione lunga
    const description = item.description.length > 45 ? item.description.substring(0, 45) + "..." : item.description;

    doc.text(description, 20, y);
    doc.text(item.quantity.toString(), 110, y, { align: "center" });
    doc.text(itemPrice, 140, y, { align: "right" });
    doc.text(itemTotal, 190, y, { align: "right" });
    
    y += 7;
  });

  // --- TOTALI ---
  y += 5;
  doc.line(110, y, 190, y);
  y += 5;

  const formatCurrency = (val: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  doc.text("Imponibile:", 140, y, { align: "right" });
  doc.text(formatCurrency(data.totals.subtotal), 190, y, { align: "right" });
  y += 5;

  doc.text("IVA (22%):", 140, y, { align: "right" });
  doc.text(formatCurrency(data.totals.tax), 190, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTALE:", 140, y, { align: "right" });
  doc.text(formatCurrency(data.totals.total), 190, y, { align: "right" });

  // Salva il PDF
  doc.save(`${data.number}.pdf`);
};