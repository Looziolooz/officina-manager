import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({ label, value, delta, icon, className }: KpiCardProps) {
  return (
    <div className={cn("kpi-card", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="kpi-label">{label}</span>
        {icon && <span className="text-[oklch(50%_0.018_240)]">{icon}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className="mt-1 text-xs">
          <span
            className={
              delta.value >= 0
                ? "text-[oklch(45%_0.14_145)]"
                : "text-[oklch(45%_0.15_25)]"
            }
          >
            {delta.value >= 0 ? "+" : ""}
            {delta.value}%
          </span>
          {delta.label && (
            <span className="text-[oklch(50%_0.018_240)] ml-1">
              {delta.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
