"use client";

import { useState } from "react";
import { createInvoiceFromJob } from "@/app/actions/accounting";
import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  jobId: string;
  hasInvoice: boolean; // Per disabilitare se esiste già
}

export default function IssueInvoiceButton({ jobId, hasInvoice }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!confirm("Confermi l'emissione della fattura per questo lavoro?")) return;
    
    setIsLoading(true);
    try {
      const res = await createInvoiceFromJob(jobId);
      if (res.success) {
        alert("Fattura emessa con successo!");
        router.push("/admin/accounting"); // Redirect alla contabilità
      } else {
        alert("Errore creazione fattura");
      }
    } catch (error) {
      console.error(error);
      alert("Errore imprevisto");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasInvoice) {
    return (
      <span className="text-xs text-emerald-400 font-bold border border-emerald-400/30 px-3 py-1 rounded-full flex items-center gap-1">
        <FileText size={12} /> Fatturata
      </span>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className="bg-primary hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50"
    >
      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
      Emetti Fattura
    </button>
  );
}