"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: "orange" | "green" | "blue" | "purple" | "red";
  sparklineData?: number[];
  suffix?: string;
}

export function KPICard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  color,
  sparklineData,
  suffix = "",
}: KPICardProps) {
  const colorClasses = {
    orange: { border: "border-orange-500/30", text: "text-orange-400", icon: "bg-orange-500/20 text-orange-400", gradient: "from-orange-500/20" },
    green: { border: "border-green-500/30", text: "text-green-400", icon: "bg-green-500/20 text-green-400", gradient: "from-green-500/20" },
    blue: { border: "border-blue-500/30", text: "text-blue-400", icon: "bg-blue-500/20 text-blue-400", gradient: "from-blue-500/20" },
    purple: { border: "border-purple-500/30", text: "text-purple-400", icon: "bg-purple-500/20 text-purple-400", gradient: "from-purple-500/20" },
    red: { border: "border-red-500/30", text: "text-red-400", icon: "bg-red-500/20 text-red-400", gradient: "from-red-500/20" },
  };

  const styles = colorClasses[color];
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border ${styles.border} p-6 shadow-lg`}
    >
      <div className={`absolute inset-0 bg-linear-to-br ${styles.gradient} to-transparent opacity-20`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">{title}</p>
            <h3 className={`text-3xl font-black ${styles.text} font-mono tracking-tight`}>
              {value} {suffix && <span className="text-xl ml-1">{suffix}</span>}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl ${styles.icon} flex items-center justify-center`}>
            {icon}
          </div>
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend === "up" ? "bg-green-500/20 text-green-400" : trend === "down" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"}`}>
              <TrendIcon size={12} /> {Math.abs(change)}%
            </div>
            <span className="text-xs text-gray-500">vs ieri</span>
          </div>
        )}

        {sparklineData && (
          <div className="mt-4 h-10 flex items-end gap-1 opacity-50">
            {sparklineData.map((v, i) => (
              <div key={i} style={{ height: `${(v / Math.max(...sparklineData)) * 100}%` }} className={`flex-1 rounded-t-sm ${styles.text.replace('text', 'bg')}`} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}