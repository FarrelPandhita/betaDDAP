import type { ReactNode } from "react";
import clsx from "clsx";

// ===== BUTTON =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          // Variants
          "bg-primary text-white hover:bg-primary-700 active:scale-95 shadow-sm hover:shadow-md":
            variant === "primary",
          "bg-surface-tertiary text-text-primary border border-border hover:bg-surface-secondary hover:border-border-strong active:scale-95":
            variant === "secondary",
          "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary active:scale-95":
            variant === "ghost",
          "bg-danger text-white hover:opacity-90 active:scale-95":
            variant === "danger",
          // Sizes
          "text-xs px-3 py-1.5": size === "sm",
          "text-sm px-4 py-2": size === "md",
          "text-base px-6 py-3": size === "lg",
          // Full width
          "w-full": fullWidth,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ===== STATUS PILL =====
import type { NodeStatus } from "@/store/progressStore";

interface StatusPillProps {
  status: NodeStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<NodeStatus, { label: string; className: string; dot: string }> = {
  not_started: {
    label: "Not Started",
    className: "bg-surface-tertiary text-text-muted border border-border",
    dot: "bg-text-muted",
  },
  learning: {
    label: "Learning",
    className: "bg-primary-50 text-primary-700 border border-primary-200",
    dot: "bg-primary animate-pulse",
  },
  done: {
    label: "Done",
    className: "bg-success-light text-green-700 border border-green-200",
    dot: "bg-success",
  },
};

export function StatusPill({ status, size = "md" }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        config.className,
        {
          "text-xs px-2 py-0.5": size === "sm",
          "text-sm px-3 py-1": size === "md",
        }
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

// ===== BADGE =====
interface BadgeProps {
  children: ReactNode;
  color?: "blue" | "purple" | "green" | "orange" | "red" | "default";
}

export function Badge({ children, color = "default" }: BadgeProps) {
  const colorMap = {
    default: "bg-surface-tertiary text-text-secondary border-border",
    blue: "bg-primary-50 text-primary-700 border-primary-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-success-light text-green-700 border-green-200",
    orange: "bg-warning-light text-amber-700 border-amber-200",
    red: "bg-danger-light text-red-700 border-red-200",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border",
        colorMap[color]
      )}
    >
      {children}
    </span>
  );
}

// ===== PROGRESS BAR =====
interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ percent, color = "#2563EB", height = 6, showLabel }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div
        className="w-full bg-surface-tertiary rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
          }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-text-muted mt-1 text-right font-medium">{percent}%</p>
      )}
    </div>
  );
}
