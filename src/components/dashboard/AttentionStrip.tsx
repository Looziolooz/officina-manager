import Link from "next/link";
import { AlertTriangle, FileText, Wrench, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AttentionStripProps {
  lowStockParts: number;
  invoicesIssued: number;
  averageJobValue: number;
}

// Striscia "Da tenere d'occhio": porta in primo piano le informazioni azionabili
// già calcolate, pensata per un titolare non esperto. Tutto in tema scuro.
export function AttentionStrip({ lowStockParts, invoicesIssued, averageJobValue }: AttentionStripProps) {
  const hasLowStock = lowStockParts > 0;

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Da tenere d&apos;occhio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ricambi sotto scorta: alert azionabile, link diretto al magazzino */}
        <Link
          href="/admin/warehouse"
          className={`group rounded-xl border p-4 flex items-center justify-between transition-colors ${
            hasLowStock
              ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
              : "bg-slate-900 border-white/10 hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                hasLowStock ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-400"
              }`}
            >
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className={`text-xl font-bold ${hasLowStock ? "text-amber-300" : "text-white"}`}>
                {lowStockParts}
              </p>
              <p className="text-xs text-gray-400">
                {hasLowStock ? "ricambi sotto scorta — riordina" : "ricambi sotto scorta"}
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-gray-300" />
        </Link>

        {/* Fatture emesse questo mese */}
        <div className="rounded-xl bg-slate-900 border border-white/10 p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-white/5 text-blue-400 flex items-center justify-center">
            <FileText size={18} />
          </span>
          <div>
            <p className="text-xl font-bold text-white">{invoicesIssued}</p>
            <p className="text-xs text-gray-400">fatture questo mese</p>
          </div>
        </div>

        {/* Valore medio di un lavoro (ultimi 30 giorni) */}
        <div className="rounded-xl bg-slate-900 border border-white/10 p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-white/5 text-green-400 flex items-center justify-center">
            <Wrench size={18} />
          </span>
          <div>
            <p className="text-xl font-bold text-white">{formatCurrency(averageJobValue)}</p>
            <p className="text-xs text-gray-400">valore medio lavoro (30 gg)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
