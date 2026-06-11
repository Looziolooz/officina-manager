import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface DashboardKpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  /** Variazione percentuale REALE rispetto a ieri. Ometti se non disponibile. */
  delta?: { value: number; label?: string };
  /** Spiegazione in parole semplici, mostrata al passaggio del mouse (per non esperti). */
  hint?: string;
}

// Card KPI in tema scuro, coerente con il resto della dashboard e con la shell admin.
// Server component: nessuna interattività client, il tooltip usa l'attributo title.
export function DashboardKpiCard({ label, value, icon, delta, hint }: DashboardKpiCardProps) {
  const isUp = delta ? delta.value >= 0 : false;

  return (
    <div className="rounded-2xl bg-surface border border-border p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </span>
          {hint && (
            <span
              title={hint}
              aria-label={hint}
              className="text-muted-foreground hover:text-foreground cursor-help"
            >
              <Info size={13} />
            </span>
          )}
        </div>
        <span className="text-muted-foreground">{icon}</span>
      </div>

      <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>

      {delta && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              isUp ? "bg-green-500/15 text-success" : "bg-red-500/15 text-red-400"
            }`}
          >
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isUp ? "+" : ""}
            {delta.value}%
          </span>
          {delta.label && <span className="text-xs text-muted-foreground">{delta.label}</span>}
        </div>
      )}
    </div>
  );
}
