// src/components/documents/PrintReceiptButton.tsx
"use client";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EntryReceipt } from "./EntryReceipt";
import { Printer } from "lucide-react";
import { ReceiptData } from "@/types/business";

export default function PrintReceiptButton({ customerData }: { customerData: ReceiptData }) {
  return (
    <PDFDownloadLink
      document={<EntryReceipt data={customerData} />}
      fileName={`ricevuta_${customerData.plate.replace(/\s/g, "_")}.pdf`}
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
    >
      {({ loading }) => (
        <>
          <Printer size={18} />
          {loading ? "Generazione..." : "Stampa Ricevuta"}
        </>
      )}
    </PDFDownloadLink>
  );
}