"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// TypeWriter - Types out text line-by-line with a blinking cursor
// Used for the intro transmission and dramatic reveals.
// =============================================================================

type TypeWriterProps = {
  /** Lines of text to type out sequentially */
  lines: readonly string[] | string[];
  /** Delay between characters in ms */
  charDelay?: number;
  /** Delay between lines in ms */
  lineDelay?: number;
  /** Called when all lines have finished typing */
  onComplete?: () => void;
  /** Show blinking cursor at the end */
  showCursor?: boolean;
  className?: string;
  lineClassName?: string;
};

export default function TypeWriter({
  lines,
  charDelay = 35,
  lineDelay = 400,
  onComplete,
  showCursor = true,
  className,
  lineClassName,
}: TypeWriterProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isComplete) return;
    if (currentLine >= lines.length) {
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    const line = lines[currentLine];

    if (currentChar < line.length) {
      // Still typing current line
      const timeout = setTimeout(() => {
        setCurrentChar((prev) => prev + 1);
      }, charDelay);
      return () => clearTimeout(timeout);
    } else {
      // Line complete, move to next
      const timeout = setTimeout(() => {
        setCompletedLines((prev) => [...prev, line]);
        setCurrentLine((prev) => prev + 1);
        setCurrentChar(0);
      }, lineDelay);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, currentChar, lines, charDelay, lineDelay, isComplete]);

  /** Allow skipping the animation */
  const skip = useCallback(() => {
    setCompletedLines([...lines]);
    setCurrentLine(lines.length);
    setCurrentChar(0);
    setIsComplete(true);
    onCompleteRef.current?.();
  }, [lines]);

  // Build the partial text of the currently-typing line
  const activeLine =
    currentLine < lines.length
      ? lines[currentLine].slice(0, currentChar)
      : null;

  return (
    <div className={cn("font-mono text-sm", className)} onClick={skip}>
      {completedLines.map((line, i) => (
        <p key={i} className={cn("text-text-dim", lineClassName)}>
          {line}
        </p>
      ))}

      {activeLine !== null && (
        <p className={cn("text-text-primary", lineClassName)}>
          {activeLine}
          {showCursor && (
            <span className="inline-block w-[0.6em] h-[1.1em] bg-terminal ml-[1px] align-text-bottom animate-[blink-cursor_800ms_step-end_infinite]" />
          )}
        </p>
      )}

      {isComplete && showCursor && (
        <span className="inline-block w-[0.6em] h-[1.1em] bg-terminal ml-[1px] align-text-bottom animate-[blink-cursor_800ms_step-end_infinite]" />
      )}
    </div>
  );
}
