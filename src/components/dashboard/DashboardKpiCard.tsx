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
    <div className="rounded-2xl bg-slate-900 border border-white/10 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            {label}
          </span>
          {hint && (
            <span
              title={hint}
              aria-label={hint}
              className="text-gray-500 hover:text-gray-300 cursor-help"
            >
              <Info size={13} />
            </span>
          )}
        </div>
        <span className="text-gray-400">{icon}</span>
      </div>

      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>

      {delta && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              isUp ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
            }`}
          >
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isUp ? "+" : ""}
            {delta.value}%
          </span>
          {delta.label && <span className="text-xs text-gray-500">{delta.label}</span>}
        </div>
      )}
    </div>
  );
}
