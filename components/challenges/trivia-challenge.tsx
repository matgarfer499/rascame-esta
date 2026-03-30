"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  TRIVIA_QUESTIONS_PER_ROUND,
  TRIVIA_CORRECT_TO_PASS,
} from "@/lib/constants";
import { shuffle } from "@/lib/utils";
import { TRIVIA_QUESTIONS } from "@/lib/content";
import type { TriviaQuestion } from "@/lib/types";
import {
  IndustrialButton,
  ScreenShell,
  ScanLines,
  ProgressBar,
} from "@/components/ui";

// =============================================================================
// TriviaChallenge - Group trivia about the friend circle
// All 10 questions shown each round. Need TRIVIA_CORRECT_TO_PASS to win.
// No time limit — enjoy the questions and have a laugh.
// =============================================================================

type TriviaChallengeProps = {
  onComplete: () => void;
  onFail: () => void;
};

export default function TriviaChallenge({
  onComplete,
  onFail,
}: TriviaChallengeProps) {
  // Shuffle questions and their options once on mount
  const questions = useMemo(() => {
    return shuffle([...TRIVIA_QUESTIONS])
      .slice(0, TRIVIA_QUESTIONS_PER_ROUND)
      .map((q) => {
        const correctAnswer = q.options[q.correctIndex];
        const shuffledOptions = shuffle([...q.options]);
        return {
          ...q,
          options: shuffledOptions,
          correctIndex: shuffledOptions.indexOf(correctAnswer),
        };
      });
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex] as TriviaQuestion | undefined;

  /** Player selects an answer */
  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showResult || !currentQuestion) return;

      setSelectedOption(optionIndex);
      setShowResult(true);

      const isCorrect = optionIndex === currentQuestion.correctIndex;
      const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

      // After brief feedback delay, advance or finish
      setTimeout(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= questions.length) {
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

  if (!currentQuestion) return null;

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-condensed text-2xl text-warning uppercase tracking-wider">
            {UI.triviaTitle}
          </h2>
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
            {UI.triviaCorrect}: {correctCount}/{TRIVIA_CORRECT_TO_PASS} {UI.triviaNeeded}
          </span>
        </div>

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
