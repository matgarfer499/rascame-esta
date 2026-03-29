"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// CodeReveal - Renders a PSN code on a Canvas element (not DOM text)
// This prevents copy-paste. Adds character rotation and noise for obfuscation.
// Noise is rendered via a CSS overlay (tiny pre-generated texture) instead of
// per-pixel iteration, eliminating ~550K Math.random() calls on DPR=3 devices.
// =============================================================================

type CodeRevealProps = {
  /** PSN code string (e.g., "ABCD-1234-EFGH") */
  code: string;
  /** Canvas width in CSS pixels */
  width: number;
  /** Canvas height in CSS pixels */
  height: number;
  /** Opacity (0-1) for fade-out effect */
  opacity?: number;
  className?: string;
};

/** Random rotation in degrees for each character (obfuscation) */
const MAX_CHAR_ROTATION = 5;

/** Random vertical offset for each character */
const MAX_CHAR_OFFSET = 2;

// ---------------------------------------------------------------------------
// Pre-generated 64x64 noise texture as a data URL (created once, reused)
// ---------------------------------------------------------------------------
let noiseDataUrl: string | null = null;

function getNoiseDataUrl(): string {
  if (noiseDataUrl) return noiseDataUrl;
  if (typeof document === "undefined") return "";

  const size = 64;
  const offscreen = document.createElement("canvas");
  offscreen.width = size;
  offscreen.height = size;
  const octx = offscreen.getContext("2d");
  if (!octx) return "";

  const imageData = octx.createImageData(size, size);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const v = Math.random() * 40;
    pixels[i] = v;
    pixels[i + 1] = v;
    pixels[i + 2] = v;
    pixels[i + 3] = 25; // low alpha — subtle noise
  }
  octx.putImageData(imageData, 0, 0);
  noiseDataUrl = offscreen.toDataURL("image/png");
  return noiseDataUrl;
}

export default function CodeReveal({
  code,
  width,
  height,
  opacity = 1,
  className,
}: CodeRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dprRef = useRef(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = dprRef.current;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, width, height);

    // Draw each character individually with slight rotation/offset
    const fontSize = Math.min(width / (code.length * 0.65), height * 0.5);
    ctx.font = `${fontSize}px var(--font-stencil), monospace`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#22C55E"; // terminal green

    const totalTextWidth = code.length * fontSize * 0.6;
    let startX = (width - totalTextWidth) / 2;
    const centerY = height / 2;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const charRotation =
        ((Math.random() - 0.5) * 2 * MAX_CHAR_ROTATION * Math.PI) / 180;
      const charOffset = (Math.random() - 0.5) * 2 * MAX_CHAR_OFFSET;

      ctx.save();
      ctx.translate(startX + fontSize * 0.3, centerY + charOffset);
      ctx.rotate(charRotation);
      ctx.fillText(char, 0, 0);
      ctx.restore();

      startX += fontSize * 0.6;
    }

    // Scan line effect (lightweight — just horizontal lines)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [code, width, height]);

  // Pre-generate noise texture on first render
  const noiseUrl = typeof window !== "undefined" ? getNoiseDataUrl() : "";

  return (
    <div className="relative inline-block" style={{ width, height, opacity }}>
      <canvas
        ref={canvasRef}
        className={cn(
          "rounded-[1px] border-2 border-terminal",
          "transition-opacity duration-[150ms] ease-linear",
          className,
        )}
        style={{ width, height }}
      />
      {/* GPU-composited noise overlay — no per-pixel JS needed */}
      {noiseUrl && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[1px]"
          style={{
            backgroundImage: `url(${noiseUrl})`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
            opacity: 0.6,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
