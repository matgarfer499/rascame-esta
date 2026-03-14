"use client";

import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import WallCard from "./wall-card";
import type { ClientCard } from "@/lib/types";

// =============================================================================
// WallGrid - 10x10 grid of scratch cards ("Wall of Fate")
// =============================================================================

type WallGridProps = {
  cards: ClientCard[];
  onSelectCard: (id: number) => void;
  className?: string;
};

export default function WallGrid({
  cards,
  onSelectCard,
  className,
}: WallGridProps) {
  return (
    <section className={cn("w-full", className)}>
      {/* Section title */}
      <h2
        className={cn(
          "font-condensed text-2xl text-alert uppercase tracking-wider",
          "border-b-2 border-bunker-700 pb-1 mb-3",
          "text-left",
        )}
      >
        {UI.wallTitle}
      </h2>

      {/* Grid — 3 cols on mobile, 5 on sm, 10 on md+ */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-[2px]">
        {cards.map((card) => (
          <WallCard
            key={card.id}
            id={card.id}
            status={card.status}
            onSelect={onSelectCard}
          />
        ))}
      </div>
    </section>
  );
}
