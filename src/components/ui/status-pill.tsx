import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "danger" | "info" | "default";

interface StatusPillProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-[oklch(95%_0.05_145)] text-[oklch(45%_0.14_145)]",
  warning: "bg-[oklch(95%_0.04_85)] text-[oklch(45%_0.12_85)]",
  danger: "bg-[oklch(95%_0.05_25)] text-[oklch(45%_0.15_25)]",
  info: "bg-[oklch(95%_0.05_250)] text-[oklch(45%_0.14_250)]",
  default: "bg-[oklch(96%_0.005_250)] text-[oklch(50%_0.018_240)]",
};

export function StatusPill({ status, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}
