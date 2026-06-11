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
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Da tenere d&apos;occhio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ricambi sotto scorta: alert azionabile, link diretto al magazzino */}
        <Link
          href="/admin/warehouse"
          className={`group rounded-xl border p-4 flex items-center justify-between transition-colors ${
            hasLowStock
              ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
              : "bg-surface border-border hover:bg-background"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                hasLowStock ? "bg-amber-500/20 text-warning" : "bg-background text-muted-foreground"
              }`}
            >
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className={`text-xl font-bold ${hasLowStock ? "text-warning" : "text-foreground"}`}>
                {lowStockParts}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasLowStock ? "ricambi sotto scorta — riordina" : "ricambi sotto scorta"}
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground" />
        </Link>

        {/* Fatture emesse questo mese */}
        <div className="rounded-xl bg-surface border border-border p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-background text-blue-600 flex items-center justify-center">
            <FileText size={18} />
          </span>
          <div>
            <p className="text-xl font-bold text-foreground">{invoicesIssued}</p>
            <p className="text-xs text-muted-foreground">fatture questo mese</p>
          </div>
        </div>

        {/* Valore medio di un lavoro (ultimi 30 giorni) */}
        <div className="rounded-xl bg-surface border border-border p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-background text-success flex items-center justify-center">
            <Wrench size={18} />
          </span>
          <div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(averageJobValue)}</p>
            <p className="text-xs text-muted-foreground">valore medio lavoro (30 gg)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
