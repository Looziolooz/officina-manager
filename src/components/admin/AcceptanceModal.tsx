// src/components/admin/AcceptanceModal.tsx
"use client";
import { useState } from "react";
import PrintReceiptButton from "../documents/PrintReceiptButton";
import { ReceiptData } from "@/types/business";

interface AcceptanceModalProps {
  vehicleData: Partial<ReceiptData>;
}

export default function AcceptanceModal({ vehicleData }: AcceptanceModalProps) {
  const [description, setDescription] = useState("");

  const completeData: ReceiptData = {
    customerName: vehicleData.customerName || "N/D",
    phone: vehicleData.phone || "N/D",
    vehicle: vehicleData.vehicle || "N/D",
    plate: vehicleData.plate || "N/D",
    km: vehicleData.km || "0",
    date: new Date().toLocaleDateString("it-IT"),
    problemDescription: description,
  };

  return (
    <div className="bg-surface border border-border p-6 rounded-3xl w-full max-w-2xl shadow-2xl">
      <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wider">Accettazione Rapida</h2>
      
      <div className="space-y-4 mb-6">
        <label className="text-muted-foreground text-xs uppercase tracking-widest">Descrizione del problema</label>
        <textarea 
          className="w-full bg-black/50 border border-border rounded-xl p-4 text-foreground text-sm outline-none focus:border-primary transition-all"
          placeholder="Esempio: Rumore avantreno, spia motore accesa..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center border-t border-border pt-6">
        <p className="text-muted-foreground text-[10px] uppercase tracking-tighter">
          Verifica i dati prima della stampa
        </p>
        <PrintReceiptButton customerData={completeData} />
      </div>
    </div>
  );
}