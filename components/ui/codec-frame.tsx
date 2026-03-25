"use client";

import Image from "next/image";
import { UI } from "@/lib/i18n";
import { CODEC_FREQUENCY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CodecPhase } from "@/hooks/use-codec-audio";

// =============================================================================
// CodecFrame - MGS1-faithful codec call UI adapted to mobile portrait
// Layout (top→bottom): Portrait → Speaker+EQ → Frequency Dial → Subtitles
// Pure presentational: all state driven by props from CodecCall.
// =============================================================================

/** Texture applied over the EQ background to simulate discrete "blocks" */
const EQ_BLOCK_TEXTURE =
  "repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.35) 5px, rgba(0,0,0,0.35) 6px)";

/** Local scanline pattern rendered over the portrait image */
const PORTRAIT_SCANLINES =
  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.45) 2px, rgba(0,0,0,0.45) 4px)";

/** Text-shadow that gives the frequency number its phosphor-green glow */
const FREQ_GLOW =
  "0 0 6px #22C55E, 0 0 18px rgba(34,197,94,0.4), 0 0 40px rgba(34,197,94,0.15)";

type CodecFrameProps = {
  phase: CodecPhase;
  subtitle: string | null;
  /** Portrait image to display while playing/ended. Defaults to /snake.webp */
  portraitSrc?: string;
  /** Speaker name shown beside the VU meter. Defaults to UI.codecSpeaker */
  speakerName?: string;
};

export default function CodecFrame({
  phase,
  subtitle,
  portraitSrc = "/snake.webp",
  speakerName = UI.codecSpeaker,
}: CodecFrameProps) {
  const isRinging = phase === "ringing";
  const isConnected = phase === "connected";
  const isPlaying = phase === "playing";
  const isEnded = phase === "ended";

  // Outer border reacts to call state
  const outerBorder =
    isRinging || isConnected || isPlaying
      ? "border-terminal/70"
      : "border-terminal/20";

  return (
    <div
      className={cn(
        "w-full max-w-sm border-2 bg-black flex flex-col flex-1 min-h-0",
        outerBorder,
      )}
    >
      {/* ── TOP: Portrait or CALL indicator ──────────────────────────── */}
      <div className="relative m-3 mb-0 border-2 border-terminal/60 overflow-hidden flex-1 min-h-0 bg-black">
        {isRinging ? (
          /* ── CALL indicator shown while ringing ── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* "CALL" text — large stencil, pulsing */}
            <span
              className="font-condensed text-7xl text-terminal tracking-[0.15em] leading-none"
              style={{ animation: "codec-pulse 700ms step-end infinite" }}
            >
              {UI.codecCallIndicator}
            </span>

            {/* Decorative incoming-call label */}
            <span className="font-mono text-[10px] text-terminal/60 tracking-[0.35em] uppercase">
              ── {UI.codecIncomingCall} ──
            </span>

            {/* Three pulsing dots with staggered delays */}
            <div className="flex gap-3 mt-1">
              {[0, 200, 400].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 bg-terminal"
                  style={{
                    animation: `codec-pulse 900ms step-end ${delay}ms infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── Snake portrait shown while playing / ended ── */
          <>
            <Image
              src={portraitSrc}
              alt="Snake"
              fill
              className={cn(
                "object-contain object-top transition-opacity duration-300",
                isEnded ? "opacity-55" : "opacity-100",
              )}
              priority
            />

            {/* Green tint layer — reinforces the phosphor-green CRT feel */}
            <div className="absolute inset-0 bg-terminal/[0.07] mix-blend-screen pointer-events-none" />

            {/* Local scanlines over the portrait */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{ backgroundImage: PORTRAIT_SCANLINES, opacity: 0.55 }}
            />
          </>
        )}
      </div>

      {/* ── MIDDLE: Speaker name + horizontal VU meter ───────────────── */}
      <div className="px-3 pt-3 pb-1 flex items-center gap-3">
        {!isRinging && (
          <span className="font-condensed text-base text-terminal tracking-widest w-12 shrink-0">
            {speakerName}
          </span>
        )}

        {/* VU meter container */}
        <div className="flex-1 h-[18px] bg-terminal/10 overflow-hidden relative border border-terminal/20">
          {/* Block texture overlay (always visible, gives the ░░░ look) */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ backgroundImage: EQ_BLOCK_TEXTURE }}
          />

          {/* Animated fill bar — only active while playing */}
          {isPlaying ? (
            <div
              className="absolute inset-0 bg-terminal origin-left z-0"
              style={{ animation: "eq-level 3.2s linear infinite" }}
            />
          ) : (
            /* Static low-level indicator when not active */
            <div
              className="absolute inset-0 bg-terminal/30 origin-left z-0"
              style={{ transform: "scaleX(0.12)" }}
            />
          )}
        </div>
      </div>

      {/* ── FREQUENCY DIAL ───────────────────────────────────────────── */}
      <div className="px-3 py-4 text-center">
        {/* Top label: ══ PTT / CODEC ══ */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="h-px flex-1 bg-terminal/25" />
          <span className="font-condensed text-[9px] text-terminal/50 tracking-[0.4em] uppercase">
            PTT / {UI.codecTitle}
          </span>
          <span className="h-px flex-1 bg-terminal/25" />
        </div>

        {/* Frequency number with glow, flanked by decorative arrows */}
        <div className="flex items-center justify-center gap-4">
          <span className="font-condensed text-2xl text-terminal/25 select-none leading-none">
            ◄
          </span>
          <span
            className={cn(
              "font-stencil text-5xl text-terminal tracking-wider leading-none",
              isEnded && "text-terminal/30",
            )}
            style={{ textShadow: isEnded ? "none" : FREQ_GLOW }}
          >
            {CODEC_FREQUENCY}
          </span>
          <span className="font-condensed text-2xl text-terminal/25 select-none leading-none">
            ►
          </span>
        </div>

        {/* Bottom label: ══ MEMORY ══ */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="h-px flex-1 bg-terminal/25" />
          <span className="font-condensed text-[9px] text-terminal/50 tracking-[0.4em] uppercase">
            {UI.codecMemoryLabel}
          </span>
          <span className="h-px flex-1 bg-terminal/25" />
        </div>
      </div>

      {/* ── BOTTOM: Subtitles ────────────────────────────────────────── */}
      <div className="border-t border-terminal/20 px-3 py-3 h-24 overflow-hidden flex items-start">
        {isConnected && (
          <span className="text-terminal/30 font-mono text-sm">. . .</span>
        )}

        {isPlaying && (
          <p
            key={subtitle}
            className="font-mono text-sm text-text-primary leading-relaxed"
          >
            {subtitle ? (
              <>&ldquo;{subtitle}&rdquo;</>
            ) : (
              <span className="text-terminal/30">. . .</span>
            )}
          </p>
        )}

        {isEnded && (
          <span className="text-terminal/45 font-mono text-[11px] tracking-widest uppercase">
            {UI.codecEndTransmission}
          </span>
        )}
      </div>
    </div>
  );
}
