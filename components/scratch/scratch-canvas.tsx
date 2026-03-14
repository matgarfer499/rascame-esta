"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  SCRATCH_BRUSH_RADIUS,
  SCRATCH_COVERAGE_THRESHOLD,
  SCRATCH_COVERAGE_CHECK_INTERVAL_MS,
} from "@/lib/constants";

// =============================================================================
// ScratchCanvas - Touch-based scratch-off canvas mechanic
// Users scratch to reveal what's underneath by clearing a cover layer.
// Coverage is calculated periodically and onThresholdReached fires once.
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
  /** Called with current coverage (0-1) on each check */
  onCoverageUpdate?: (coverage: number) => void;
  /** Cover color (the "scratch-off" layer) */
  coverColor?: string;
  className?: string;
};

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
  const lastCheckRef = useRef(0);
  const onThresholdReachedRef = useRef(onThresholdReached);
  const onCoverageUpdateRef = useRef(onCoverageUpdate);

  // Keep callback refs fresh
  useEffect(() => {
    onThresholdReachedRef.current = onThresholdReached;
  }, [onThresholdReached]);

  useEffect(() => {
    onCoverageUpdateRef.current = onCoverageUpdate;
  }, [onCoverageUpdate]);

  // Device pixel ratio for crisp rendering
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  /** Initialize cover layer */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, width, height);

    // Draw a subtle pattern on the cover (cross-hatch lines)
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
  }, [width, height, dpr, coverColor]);

  /** Calculate scratched coverage (percentage of transparent pixels) */
  const checkCoverage = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || thresholdReachedRef.current) return;

    const now = performance.now();
    if (now - lastCheckRef.current < SCRATCH_COVERAGE_CHECK_INTERVAL_MS) return;
    lastCheckRef.current = now;

    const imageData = ctx.getImageData(
      0,
      0,
      width * dpr,
      height * dpr,
    );
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    // Check alpha channel of every 4th pixel for performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) transparent++;
    }

    // Adjust total for sampling rate
    const sampledTotal = Math.ceil(total / 4);
    const coverage = transparent / sampledTotal;

    onCoverageUpdateRef.current?.(coverage);

    if (coverage >= threshold) {
      thresholdReachedRef.current = true;
      onThresholdReachedRef.current();
    }
  }, [width, height, dpr, threshold]);

  /** Scratch at a given position */
  const scratch = useCallback(
    (x: number, y: number) => {
      const ctx = ctxRef.current;
      if (!ctx || thresholdReachedRef.current) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      checkCoverage();
    },
    [brushRadius, checkCoverage],
  );

  /** Get position relative to canvas from a native or React event */
  const getPosition = useCallback(
    (e: TouchEvent | MouseEvent | React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      let clientX: number | undefined;
      let clientY: number | undefined;

      if ("touches" in e) {
        // Native TouchEvent
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

  // --- Native touch handlers (attached via addEventListener with passive: false) ---

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      isScratchingRef.current = true;
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
    checkCoverage();
  }, [checkCoverage]);

  // Attach native touch listeners with { passive: false } so preventDefault works
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

  // --- React mouse handlers (no passive issue with mouse events) ---

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isScratchingRef.current = true;
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
