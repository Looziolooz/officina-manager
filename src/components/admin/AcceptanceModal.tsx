"use client";
import { useState } from "react";
import PrintReceiptButton from "../documents/PrintReceiptButton";

export default function AcceptanceModal({ vehicleData }: any) {
  const [description, setDescription] = useState("");

  return (
    <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-2xl shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Nuova Accettazione</h2>
      
      <div className="space-y-4 mb-6">
        <textarea 
          className="w-full bg-black/50 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-primary"
          placeholder="Descrivi il problema lamentato dal cliente..."
          rows={4}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-xs italic">Compila la descrizione prima di stampare.</p>
        <PrintReceiptButton 
          customerData={{
            ...vehicleData,
            problemDescription: description,
            date: new Date().toLocaleDateString()
          }} 
        />
      </div>
    </div>
  );
}