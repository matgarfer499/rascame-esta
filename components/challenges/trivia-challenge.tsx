"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  TRIVIA_QUESTIONS_PER_ROUND,
  TRIVIA_CORRECT_TO_PASS,
  TRIVIA_TIME_LIMIT_SECONDS,
} from "@/lib/constants";
import { shuffle } from "@/lib/utils";
import { TRIVIA_QUESTIONS } from "@/lib/content";
import type { TriviaQuestion } from "@/lib/types";
import {
  IndustrialButton,
  ScreenShell,
  ScanLines,
  Timer,
  ProgressBar,
} from "@/components/ui";

// =============================================================================
// TriviaChallenge - Split-screen trivia about the opposite twin
// Each twin answers questions about the other.
// Need TRIVIA_CORRECT_TO_PASS correct out of TRIVIA_QUESTIONS_PER_ROUND.
// =============================================================================

type TriviaChallengeProps = {
  onComplete: () => void;
  onFail: () => void;
};

export default function TriviaChallenge({
  onComplete,
  onFail,
}: TriviaChallengeProps) {
  // Select random questions
  const questions = useMemo(() => {
    const shuffled = shuffle([...TRIVIA_QUESTIONS]);
    return shuffled.slice(0, TRIVIA_QUESTIONS_PER_ROUND);
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex] as TriviaQuestion | undefined;

  /** Player selects an answer */
  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showResult || !currentQuestion) return;

      setSelectedOption(optionIndex);
      setShowResult(true);

      const isCorrect = optionIndex === currentQuestion.correctIndex;
      const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

      // After a brief delay, move to next question or finish
      setTimeout(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= questions.length) {
          // All questions answered
          setFinished(true);
          if (newCorrectCount >= TRIVIA_CORRECT_TO_PASS) {
            onComplete();
          } else {
            onFail();
          }
          return;
        }

        setCorrectCount(newCorrectCount);
        setCurrentIndex(nextIndex);
        setSelectedOption(null);
        setShowResult(false);
      }, 1200);
    },
    [showResult, currentQuestion, correctCount, currentIndex, questions.length, onComplete, onFail],
  );

  /** Time ran out */
  const handleTimeUp = useCallback(() => {
    if (!finished) {
      setFinished(true);
      onFail();
    }
  }, [finished, onFail]);

  if (!currentQuestion) return null;

  const targetTwinName =
    currentQuestion.targetTwin === "cristobal" ? UI.twin1 : UI.twin2;
  const answeringTwinName =
    currentQuestion.targetTwin === "cristobal" ? UI.twin2 : UI.twin1;

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-condensed text-2xl text-warning uppercase tracking-wider">
            {UI.triviaTitle}
          </h2>
          <Timer
            initialSeconds={TRIVIA_TIME_LIMIT_SECONDS}
            mode="countdown"
            variant="alert"
            onComplete={handleTimeUp}
          />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-text-dead">
            {UI.triviaQuestion} {currentIndex + 1}/{questions.length}
          </span>
          <ProgressBar
            value={(currentIndex + 1) / questions.length}
            variant="terminal"
            height="h-2"
            className="flex-1"
          />
        </div>

        {/* Score */}
        <div className="flex justify-between mb-4 text-xs font-mono">
          <span className="text-terminal">
            Correctas: {correctCount}/{TRIVIA_CORRECT_TO_PASS} necesarias
          </span>
        </div>

        {/* Who answers */}
        <p className="font-mono text-xs text-text-dim mb-2">
          {answeringTwinName} responde sobre {targetTwinName}:
        </p>

        {/* Question */}
        <div className="border-2 border-warning p-3 mb-4">
          <p className="font-mono text-sm text-text-primary leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const showCorrectHighlight = showResult && isCorrect;
            const showWrongHighlight = showResult && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                type="button"
                disabled={showResult}
                onClick={() => handleAnswer(idx)}
                className={cn(
                  "w-full text-left px-3 py-2.5",
                  "border-2 rounded-[1px]",
                  "font-mono text-sm",
                  "transition-colors duration-[100ms] ease-linear",
                  // Default
                  !showResult && "border-bunker-700 bg-bunker-800 text-text-primary hover:border-bunker-500 cursor-pointer",
                  // Correct answer highlight
                  showCorrectHighlight && "border-terminal bg-bunker-900 text-terminal",
                  // Wrong answer highlight
                  showWrongHighlight && "border-alert bg-alert-deep text-text-primary",
                  // Non-selected during reveal
                  showResult && !isSelected && !isCorrect && "opacity-30",
                )}
              >
                <span className="text-text-dead mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </ScreenShell>
  );
}
