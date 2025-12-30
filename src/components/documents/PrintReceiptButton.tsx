"use client";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EntryReceipt } from "./EntryReceipt";
import { FileDown, Printer } from "lucide-react";

export default function PrintReceiptButton({ customerData }: any) {
  return (
    <PDFDownloadLink
      document={<EntryReceipt data={customerData} />}
      fileName={`ricevuta_${customerData.plate}.pdf`}
      className="inline-flex items-center gap-2 bg-accent hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
    >
      {({ loading }) => (
        <>
          {loading ? "Generazione..." : <><Printer size={18} /> Stampa Ricevuta</>}
        </>
      )}
    </PDFDownloadLink>
  );
}