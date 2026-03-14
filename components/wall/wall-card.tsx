"use client";

import { cn } from "@/lib/utils";
import { padNumber } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { Stamp } from "@/components/ui";
import type { CardStatus } from "@/lib/types";

// =============================================================================
// WallCard - Single card in the Wall of Fate grid
// Shows card number, status overlay (classified/eliminated/scratched)
// =============================================================================

type WallCardProps = {
  id: number;
  status: CardStatus;
  onSelect: (id: number) => void;
};

export default function WallCard({ id, status, onSelect }: WallCardProps) {
  const isInteractive = status === "sealed";
  const isEliminated = status === "eliminated";
  const isScratched = status === "scratched" || status === "confirmed";

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={() => isInteractive && onSelect(id)}
      className={cn(
        "relative aspect-square",
        "flex flex-col items-center justify-center",
        "border border-bunker-700 rounded-[1px]",
        "transition-colors duration-[100ms] ease-linear",
        "overflow-hidden",
        // Sealed (default, interactive)
        isInteractive && [
          "bg-bunker-800 cursor-pointer",
          "hover:bg-bunker-700 hover:border-bunker-500",
          "active:bg-bunker-700 active:border-alert",
          "shadow-[1px_1px_0px_#0A0A0A]",
        ],
        // Eliminated
        isEliminated && "bg-bunker-950 opacity-30 cursor-default",
        // Scratched / confirmed
        isScratched && [
          "bg-bunker-900 cursor-pointer",
          "border-terminal",
        ],
        // Confirmed specifically
        status === "confirmed" && "border-terminal bg-bunker-900",
      )}
      aria-label={`${UI.cardLabel} ${padNumber(id)}`}
    >
      {/* Card number */}
      <span
        className={cn(
          "font-stencil text-xs tabular-nums leading-none",
          isEliminated ? "text-text-dead" : "text-text-dim",
          isScratched && "text-terminal",
        )}
      >
        {padNumber(id)}
      </span>

      {/* Status label */}
      {isInteractive && (
        <span className="font-mono text-[6px] text-text-dead uppercase mt-0.5">
          {UI.cardClassified}
        </span>
      )}

      {/* Eliminated stamp overlay */}
      {isEliminated && (
        <Stamp
          text={UI.cardEliminated}
          variant="danger"
          rotation={-12}
          animate={false}
          className="text-[8px]"
        />
      )}

      {/* Confirmed checkmark */}
      {status === "confirmed" && (
        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-terminal rounded-[1px]" />
      )}
    </button>
  );
}
