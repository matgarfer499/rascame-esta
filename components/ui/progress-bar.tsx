"use client";

import { cn } from "@/lib/utils";

// =============================================================================
// ProgressBar - Industrial progress indicator with hard edges
// =============================================================================

type ProgressBarVariant = "terminal" | "alert" | "warning";

type ProgressBarProps = {
  /** Progress value between 0 and 1 */
  value: number;
  variant?: ProgressBarVariant;
  /** Show percentage text overlay */
  showLabel?: boolean;
  /** Height class override (default h-3) */
  height?: string;
  className?: string;
};

const FILL_STYLES: Record<ProgressBarVariant, string> = {
  terminal: "bg-terminal",
  alert: "bg-alert",
  warning: "bg-warning",
};

export default function ProgressBar({
  value,
  variant = "terminal",
  showLabel = false,
  height = "h-3",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percentage = Math.round(clamped * 100);

  return (
    <div
      className={cn(
        "relative w-full bg-bunker-900 border border-bunker-700 rounded-[1px]",
        height,
        className,
      )}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Fill bar — no transition, instant/stepped updates feel mechanical */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-[1px]",
          FILL_STYLES[variant],
        )}
        style={{ width: `${percentage}%` }}
      />

      {showLabel && (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "font-mono text-[10px] text-text-primary",
            "mix-blend-difference",
          )}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}
