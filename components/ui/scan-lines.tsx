"use client";

import { cn } from "@/lib/utils";

// =============================================================================
// ScanLines - CRT-style horizontal scan line overlay
// Purely decorative, adds to the industrial/bunker atmosphere.
// =============================================================================

type ScanLinesProps = {
  /** Opacity of the scan lines (0-1, default 0.04) */
  opacity?: number;
  className?: string;
};

export default function ScanLines({
  opacity = 0.04,
  className,
}: ScanLinesProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[9998]",
        className,
      )}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          backgroundSize: "100% 4px",
        }}
      />
    </div>
  );
}
