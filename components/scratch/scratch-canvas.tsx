"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  SCRATCH_BRUSH_RADIUS,
  SCRATCH_COVERAGE_THRESHOLD,
  SCRATCH_GRID_COLS,
  SCRATCH_GRID_ROWS,
} from "@/lib/constants";

// =============================================================================
// ScratchCanvas - Touch-based scratch-off canvas mechanic
// Uses grid-based coverage tracking instead of getImageData for mobile perf.
// Line interpolation between touch points for gap-free strokes.
// Coverage updates live on each stroke; threshold check fires on touch-end.
// =============================================================================

type ScratchCanvasProps = {
  /** Canvas width in CSS pixels */
  width: number;
  /** Canvas height in CSS pixels */
  height: number;
  /** Brush radius in pixels */
  brushRadius?: number;
  /** Coverage threshold (0-1) to trigger reveal */
  threshold?: number;
  /** Called when scratch coverage meets the threshold */
  onThresholdReached: () => void;
  /** Called with current coverage (0-1) on each stroke */
  onCoverageUpdate?: (coverage: number) => void;
  /** Cover color (the "scratch-off" layer) */
  coverColor?: string;
  className?: string;
};

// ---------------------------------------------------------------------------
// Grid-based coverage helpers (avoid getImageData GPU readback entirely)
// ---------------------------------------------------------------------------

/** Mark all grid cells overlapping a circle at (cx, cy) with given radius */
function markCellsForCircle(
  grid: Uint8Array,
  cx: number,
  cy: number,
  radius: number,
  cellW: number,
  cellH: number,
  cols: number,
  rows: number,
): void {
  const minCol = Math.max(0, Math.floor((cx - radius) / cellW));
  const maxCol = Math.min(cols - 1, Math.floor((cx + radius) / cellW));
  const minRow = Math.max(0, Math.floor((cy - radius) / cellH));
  const maxRow = Math.min(rows - 1, Math.floor((cy + radius) / cellH));

  const rSq = radius * radius;

  for (let row = minRow; row <= maxRow; row++) {
    // Closest Y point of cell to circle center
    const closestY = Math.max(row * cellH, Math.min(cy, (row + 1) * cellH));
    const dy = closestY - cy;
    for (let col = minCol; col <= maxCol; col++) {
      if (grid[row * cols + col]) continue; // already marked
      // Closest X point of cell to circle center
      const closestX = Math.max(col * cellW, Math.min(cx, (col + 1) * cellW));
      const dx = closestX - cx;
      if (dx * dx + dy * dy <= rSq) {
        grid[row * cols + col] = 1;
      }
    }
  }
}

/** Mark grid cells along a line segment from (x0,y0) to (x1,y1) */
function markCellsForLine(
  grid: Uint8Array,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
  cellW: number,
  cellH: number,
  cols: number,
  rows: number,
): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Step in increments smaller than brush radius to avoid gaps in grid marking
  const steps = Math.max(1, Math.ceil(dist / (radius * 0.5)));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    markCellsForCircle(
      grid,
      x0 + dx * t,
      y0 + dy * t,
      radius,
      cellW,
      cellH,
      cols,
      rows,
    );
  }
}

/** Count marked cells and return coverage ratio (0-1) */
function computeCoverage(grid: Uint8Array): number {
  let marked = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i]) marked++;
  }
  return marked / grid.length;
}

export default function ScratchCanvas({
  width,
  height,
  brushRadius = SCRATCH_BRUSH_RADIUS,
  threshold = SCRATCH_COVERAGE_THRESHOLD,
  onThresholdReached,
  onCoverageUpdate,
  coverColor = "#2A2A2A",
  className,
}: ScratchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isScratchingRef = useRef(false);
  const thresholdReachedRef = useRef(false);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);

  // Grid-based coverage tracking (no GPU readback needed)
  const gridRef = useRef<Uint8Array>(
    new Uint8Array(SCRATCH_GRID_COLS * SCRATCH_GRID_ROWS),
  );
  const cellWRef = useRef(width / SCRATCH_GRID_COLS);
  const cellHRef = useRef(height / SCRATCH_GRID_ROWS);

  // Stable callback refs
  const onThresholdReachedRef = useRef(onThresholdReached);
  const onCoverageUpdateRef = useRef(onCoverageUpdate);

  useEffect(() => {
    onThresholdReachedRef.current = onThresholdReached;
  }, [onThresholdReached]);

  useEffect(() => {
    onCoverageUpdateRef.current = onCoverageUpdate;
  }, [onCoverageUpdate]);

  // Device pixel ratio for crisp rendering
  const dprRef = useRef(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  );

  /** Initialize cover layer */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = dprRef.current;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, width, height);

    // Subtle cross-hatch pattern on the cover
    ctx.strokeStyle = "#3A3A3A";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < width + height; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(0, i);
      ctx.stroke();
    }

    // "RASCA AQUÍ" text in center
    ctx.fillStyle = "#525252";
    ctx.font = `${16}px var(--font-condensed), sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RASCA AQUÍ", width / 2, height / 2);

    ctxRef.current = ctx;
    thresholdReachedRef.current = false;
    prevPosRef.current = null;

    // Reset grid
    const grid = new Uint8Array(SCRATCH_GRID_COLS * SCRATCH_GRID_ROWS);
    gridRef.current = grid;
    cellWRef.current = width / SCRATCH_GRID_COLS;
    cellHRef.current = height / SCRATCH_GRID_ROWS;
  }, [width, height, coverColor]);

  /** Check grid coverage and fire threshold callback (called only on touch-end) */
  const checkCoverage = useCallback(() => {
    if (thresholdReachedRef.current) return;

    const coverage = computeCoverage(gridRef.current);

    if (coverage >= threshold) {
      thresholdReachedRef.current = true;
      onThresholdReachedRef.current();
    }
  }, [threshold]);

  /** Draw a scratch stroke from prevPos to (x,y), update grid, fire live coverage update */
  const scratch = useCallback(
    (x: number, y: number) => {
      const ctx = ctxRef.current;
      if (!ctx || thresholdReachedRef.current) return;

      const prev = prevPosRef.current;
      const grid = gridRef.current;
      const cellW = cellWRef.current;
      const cellH = cellHRef.current;

      ctx.globalCompositeOperation = "destination-out";

      if (prev) {
        // Draw a line from previous position for gap-free strokes
        ctx.lineWidth = brushRadius * 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Mark grid cells along the line
        markCellsForLine(
          grid,
          prev.x,
          prev.y,
          x,
          y,
          brushRadius,
          cellW,
          cellH,
          SCRATCH_GRID_COLS,
          SCRATCH_GRID_ROWS,
        );
      } else {
        // First touch — stamp a single circle
        ctx.beginPath();
        ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
        ctx.fill();

        markCellsForCircle(
          grid,
          x,
          y,
          brushRadius,
          cellW,
          cellH,
          SCRATCH_GRID_COLS,
          SCRATCH_GRID_ROWS,
        );
      }

      ctx.globalCompositeOperation = "source-over";
      prevPosRef.current = { x, y };

      // Live coverage update for progress bar (grid read is ~240 bytes, near-free)
      onCoverageUpdateRef.current?.(computeCoverage(grid));
    },
    [brushRadius],
  );

  /** Get position relative to canvas from a touch or mouse event */
  const getPosition = useCallback(
    (e: TouchEvent | MouseEvent | React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      let clientX: number | undefined;
      let clientY: number | undefined;

      if ("touches" in e) {
        clientX = e.touches[0]?.clientX;
        clientY = e.touches[0]?.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (clientX === undefined || clientY === undefined) return null;

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Native touch handlers (passive: false so preventDefault works)
  // ---------------------------------------------------------------------------

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      isScratchingRef.current = true;
      prevPosRef.current = null; // reset line origin
      const pos = getPosition(e);
      if (pos) scratch(pos.x, pos.y);
    },
    [getPosition, scratch],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (!isScratchingRef.current) return;
      const pos = getPosition(e);
      if (pos) scratch(pos.x, pos.y);
    },
    [getPosition, scratch],
  );

  const handleTouchEnd = useCallback(() => {
    isScratchingRef.current = false;
    prevPosRef.current = null;
    checkCoverage(); // coverage only checked when finger lifts
  }, [checkCoverage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // ---------------------------------------------------------------------------
  // React mouse handlers (desktop fallback)
  // ---------------------------------------------------------------------------

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isScratchingRef.current = true;
      prevPosRef.current = null;
      const pos = getPosition(e);
      if (pos) scratch(pos.x, pos.y);
    },
    [getPosition, scratch],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isScratchingRef.current) return;
      const pos = getPosition(e);
      if (pos) scratch(pos.x, pos.y);
    },
    [getPosition, scratch],
  );

  const handleMouseEnd = useCallback(() => {
    isScratchingRef.current = false;
    prevPosRef.current = null;
    checkCoverage();
  }, [checkCoverage]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "touch-none rounded-[1px] border border-bunker-700",
        className,
      )}
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseEnd}
      onMouseLeave={handleMouseEnd}
    />
  );
}
