"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// CodeReveal - Renders a PSN code on a Canvas element (not DOM text)
// This prevents copy-paste. Adds character rotation and noise for obfuscation.
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

export default function CodeReveal({
  code,
  width,
  height,
  opacity = 1,
  className,
}: CodeRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, width, height);

    // Add subtle noise texture
    const noiseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const noisePixels = noiseImageData.data;
    for (let i = 0; i < noisePixels.length; i += 4) {
      const noise = Math.random() * 15;
      noisePixels[i] += noise;
      noisePixels[i + 1] += noise;
      noisePixels[i + 2] += noise;
    }
    ctx.putImageData(noiseImageData, 0, 0);

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

    // Add scan line effect over the code
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [code, width, height, dpr]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "rounded-[1px] border-2 border-terminal",
        "transition-opacity duration-[150ms] ease-linear",
        className,
      )}
      style={{ width, height, opacity }}
    />
  );
}
