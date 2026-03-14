"use client";

import { cn } from "@/lib/utils";

// =============================================================================
// Stamp - Overlaid stamp marking (e.g. "ELIMINADO", "CLASIFICADO")
// Appears with a mechanical stamp-in animation.
// =============================================================================

type StampVariant = "danger" | "military" | "warning";

type StampProps = {
  text: string;
  variant?: StampVariant;
  /** Rotation angle in degrees (default -7) */
  rotation?: number;
  /** Whether to play the stamp-in animation */
  animate?: boolean;
  className?: string;
};

const VARIANT_STYLES: Record<StampVariant, string> = {
  danger: "text-alert border-alert",
  military: "text-military border-military",
  warning: "text-warning border-warning",
};

export default function Stamp({
  text,
  variant = "danger",
  rotation = -7,
  animate = true,
  className,
}: StampProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        "pointer-events-none",
        className,
      )}
    >
      <span
        className={cn(
          "font-condensed text-2xl uppercase tracking-widest",
          "border-4 rounded-[1px] px-3 py-1",
          "opacity-85",
          VARIANT_STYLES[variant],
          animate && "animate-[stamp-in_200ms_step-end_forwards]",
        )}
        style={
          {
            "--stamp-rotation": `${rotation}deg`,
            transform: `rotate(${rotation}deg)`,
          } as React.CSSProperties
        }
      >
        {text}
      </span>
    </div>
  );
}
