"use client";

// =============================================================================
// BossChallenge (Liquid Final) - Multi-phase boss fight with HP bar
// Rotates through 5 action types. Boss has HP that decreases on success
// and recovers on failure. Visual effects escalate across 3 phases.
// =============================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  BOSS_MAX_HP,
  BOSS_HP_RECOVERY,
  BOSS_MAX_FAILURES,
  BOSS_PHASE_2_THRESHOLD,
  BOSS_PHASE_3_THRESHOLD,
  BOSS_ACTION_CONFIGS,
  BOSS_ACTION_GAP_MS,
  BOSS_PHASE_TIME_MULTIPLIERS,
} from "@/lib/constants";
import type { BossActionType, BossPhase } from "@/lib/types";
import { ScreenShell, ScanLines, ProgressBar } from "@/components/ui";
import {
  DoubleStrikeAction,
  WarCryAction,
  HoldPositionAction,
  QuickComboAction,
  TacticalSilenceAction,
} from "./boss";

// =============================================================================
// Types
// =============================================================================

type BossChallengeProps = {
  onComplete: () => void;
  onFail: () => void;
};

type FightState = "prepare" | "action" | "result-success" | "result-fail" | "defeated" | "game-over";

// =============================================================================
// Helpers
// =============================================================================

const ALL_ACTIONS: BossActionType[] = [
  "double-strike",
  "war-cry",
  "hold-position",
  "quick-combo",
  "tactical-silence",
];

const ACTION_LABELS: Record<BossActionType, { name: string; hint: string }> = {
  "double-strike": { name: UI.bossDoubleStrike, hint: UI.bossDoubleStrikeHint },
  "war-cry": { name: UI.bossWarCry, hint: UI.bossWarCryHint },
  "hold-position": { name: UI.bossHoldPosition, hint: UI.bossHoldPositionHint },
  "quick-combo": { name: UI.bossQuickCombo, hint: UI.bossQuickComboHint },
  "tactical-silence": { name: UI.bossTacticalSilence, hint: UI.bossTacticalSilenceHint },
};

/** Build a non-repeating action queue by shuffling, ensuring no adjacent dupes */
function buildActionQueue(previous?: BossActionType): BossActionType[] {
  const queue = shuffle([...ALL_ACTIONS]);
  // Ensure first item differs from the previous action
  if (previous && queue[0] === previous) {
    const swapIdx = queue.findIndex((a) => a !== previous);
    if (swapIdx > 0) [queue[0], queue[swapIdx]] = [queue[swapIdx], queue[0]];
  }
  return queue;
}

function getPhase(hp: number): BossPhase {
  if (hp > BOSS_PHASE_2_THRESHOLD) return 1;
  if (hp > BOSS_PHASE_3_THRESHOLD) return 2;
  return 3;
}

function getPhaseLabel(phase: BossPhase): string {
  if (phase === 1) return UI.bossPhase1;
  if (phase === 2) return UI.bossPhase2;
  return UI.bossPhase3;
}

/** Get the adjusted duration for an action based on the current phase */
function getAdjustedDuration(actionType: BossActionType, phase: BossPhase): number {
  const base = BOSS_ACTION_CONFIGS[actionType].duration;
  return Math.max(2, Math.round(base * BOSS_PHASE_TIME_MULTIPLIERS[phase - 1]));
}

// =============================================================================
// Component
// =============================================================================

export default function BossChallenge({ onComplete, onFail }: BossChallengeProps) {
  const [hp, setHp] = useState(BOSS_MAX_HP);
  const [failures, setFailures] = useState(0);
  const [fightState, setFightState] = useState<FightState>("prepare");
  const [currentAction, setCurrentAction] = useState<BossActionType>("double-strike");
  const [screenShake, setScreenShake] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0.04);

  const actionQueueRef = useRef<BossActionType[]>(buildActionQueue());
  const queueIndexRef = useRef(0);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback refs stable so setTimeout closures always call the latest version
  const onCompleteRef = useRef(onComplete);
  const onFailRef = useRef(onFail);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onFailRef.current = onFail; }, [onFail]);

  const phase = getPhase(hp);

  // Update glitch intensity based on phase
  useEffect(() => {
    const intensities = [0.04, 0.08, 0.15];
    setGlitchIntensity(intensities[phase - 1]);
  }, [phase]);

  /** Cleanup transition timer */
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  /** Pick the next action from the queue */
  const pickNextAction = useCallback(() => {
    let idx = queueIndexRef.current;
    let queue = actionQueueRef.current;

    if (idx >= queue.length) {
      // Rebuild queue, avoiding repeat of last action
      const lastAction = queue[queue.length - 1];
      queue = buildActionQueue(lastAction);
      actionQueueRef.current = queue;
      idx = 0;
    }

    const next = queue[idx];
    queueIndexRef.current = idx + 1;
    return next;
  }, []);

  /** Transition to the next action after a delay */
  const transitionToNextAction = useCallback(() => {
    const nextAction = pickNextAction();
    setCurrentAction(nextAction);
    setFightState("prepare");

    // Counterattack effects in phases 2-3
    const currentPhase = getPhase(hp);
    if (currentPhase >= 2) {
      setScreenShake(true);
      // Vibrate on Android
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(currentPhase === 3 ? [100, 50, 100, 50, 200] : [100, 50, 100]);
      }
      setTimeout(() => setScreenShake(false), 500);
    }

    transitionTimerRef.current = setTimeout(() => {
      setFightState("action");
    }, BOSS_ACTION_GAP_MS);
  }, [pickNextAction, hp]);

  /** Handle action success */
  const handleActionSuccess = useCallback(() => {
    const damage = BOSS_ACTION_CONFIGS[currentAction].damage;
    const newHp = Math.max(0, hp - damage);
    setHp(newHp);

    if (newHp <= 0) {
      setFightState("defeated");
      // Vibrate victory
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
      setTimeout(() => onCompleteRef.current(), 2000);
    } else {
      setFightState("result-success");
      transitionTimerRef.current = setTimeout(transitionToNextAction, 1200);
    }
  }, [currentAction, hp, transitionToNextAction]);

  /** Handle action failure */
  const handleActionFail = useCallback(() => {
    const newFailures = failures + 1;
    const newHp = Math.min(BOSS_MAX_HP, hp + BOSS_HP_RECOVERY);
    setFailures(newFailures);
    setHp(newHp);

    // Vibrate on failure
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([300, 100, 300]);
    }

    if (newFailures >= BOSS_MAX_FAILURES) {
      setFightState("game-over");
      setTimeout(() => onFailRef.current(), 2000);
    } else {
      setFightState("result-fail");
      transitionTimerRef.current = setTimeout(transitionToNextAction, 1500);
    }
  }, [failures, hp, transitionToNextAction]);

  // Start the first action on mount
  useEffect(() => {
    const firstAction = pickNextAction();
    setCurrentAction(firstAction);

    transitionTimerRef.current = setTimeout(() => {
      setFightState("action");
    }, BOSS_ACTION_GAP_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Render -----

  const hpPercent = hp / BOSS_MAX_HP;
  const actionLabel = ACTION_LABELS[currentAction];

  return (
    <ScreenShell>
      <ScanLines opacity={glitchIntensity} />

      <div
        className={cn(
          "flex flex-col h-dvh",
          screenShake && "animate-[screen-shake_300ms_step-end]",
        )}
      >
        {/* ---- Header: HP bar + phase + failures ---- */}
        <div className="pt-4 px-4 space-y-2">
          {/* Boss name + HP */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-condensed text-2xl text-alert uppercase tracking-wider">
              {UI.bossTitle}
            </h2>
            <span className="font-mono text-[10px] text-text-dead">
              {UI.bossFailures}: {failures}/{BOSS_MAX_FAILURES}
            </span>
          </div>

          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-text-dead">{UI.bossHpLabel}</span>
              <span className={cn(
                hpPercent > 0.5 ? "text-alert" : hpPercent > 0.2 ? "text-warning" : "text-terminal",
              )}>
                {Math.round(hpPercent * 100)}%
              </span>
            </div>
            <ProgressBar
              value={hpPercent}
              variant={hpPercent > 0.5 ? "alert" : hpPercent > 0.2 ? "warning" : "terminal"}
              height="h-5"
              showLabel
            />
          </div>

          {/* Phase indicator */}
          <p className={cn(
            "font-mono text-[10px] uppercase tracking-widest text-center",
            phase === 1 && "text-text-dead",
            phase === 2 && "text-warning",
            phase === 3 && "text-alert animate-[pulse-alert_500ms_step-end_infinite]",
          )}>
            {getPhaseLabel(phase)}
          </p>
        </div>

        {/* ---- Central area: action name + action component ---- */}
        <div className="flex-1 flex flex-col px-4 py-3 overflow-hidden">
          {/* Prepare state: show action name */}
          {fightState === "prepare" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="font-mono text-xs text-text-dead uppercase tracking-widest">
                {UI.bossPrepare}
              </p>
              <h3 className="font-condensed text-3xl text-warning uppercase tracking-wider text-center">
                {actionLabel.name}
              </h3>
              <p className="font-mono text-xs text-text-dim text-center">
                {actionLabel.hint}
              </p>
            </div>
          )}

          {/* Active action */}
          {fightState === "action" && (
            <div className="flex-1 flex flex-col">
              {/* Action name */}
              <div className="text-center mb-3">
                <h3 className="font-condensed text-xl text-warning uppercase tracking-wider">
                  {actionLabel.name}
                </h3>
              </div>

              {/* Action component */}
              <div className="flex-1">
                {currentAction === "double-strike" && (
                  <DoubleStrikeAction
                    key={`ds-${queueIndexRef.current}`}
                    duration={getAdjustedDuration("double-strike", phase)}
                    onSuccess={handleActionSuccess}
                    onFailure={handleActionFail}
                  />
                )}
                {currentAction === "war-cry" && (
                  <WarCryAction
                    key={`wc-${queueIndexRef.current}`}
                    duration={getAdjustedDuration("war-cry", phase)}
                    onSuccess={handleActionSuccess}
                    onFailure={handleActionFail}
                  />
                )}
                {currentAction === "hold-position" && (
                  <HoldPositionAction
                    key={`hp-${queueIndexRef.current}`}
                    duration={getAdjustedDuration("hold-position", phase)}
                    onSuccess={handleActionSuccess}
                    onFailure={handleActionFail}
                  />
                )}
                {currentAction === "quick-combo" && (
                  <QuickComboAction
                    key={`qc-${queueIndexRef.current}`}
                    duration={getAdjustedDuration("quick-combo", phase)}
                    onSuccess={handleActionSuccess}
                    onFailure={handleActionFail}
                  />
                )}
                {currentAction === "tactical-silence" && (
                  <TacticalSilenceAction
                    key={`ts-${queueIndexRef.current}`}
                    duration={getAdjustedDuration("tactical-silence", phase)}
                    onSuccess={handleActionSuccess}
                    onFailure={handleActionFail}
                  />
                )}
              </div>
            </div>
          )}

          {/* Result: success */}
          {fightState === "result-success" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="border-2 border-terminal p-4">
                <p className="font-condensed text-2xl text-terminal uppercase">
                  {UI.bossDamageDealt}
                </p>
              </div>
              <p className="font-mono text-xs text-terminal">
                -{BOSS_ACTION_CONFIGS[currentAction].damage} HP
              </p>
            </div>
          )}

          {/* Result: failure */}
          {fightState === "result-fail" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="border-2 border-alert p-4">
                <p className="font-condensed text-2xl text-alert uppercase animate-[pulse-alert_300ms_step-end_infinite]">
                  {UI.bossActionFailed}
                </p>
              </div>
              <p className="font-mono text-xs text-warning">
                {UI.bossRecovering} +{BOSS_HP_RECOVERY} HP
              </p>
            </div>
          )}

          {/* Defeated */}
          {fightState === "defeated" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="border-2 border-terminal p-6">
                <p className="font-condensed text-3xl text-terminal uppercase">
                  {UI.bossDefeated}
                </p>
              </div>
              <p className="font-mono text-xs text-text-dim">
                {UI.challengeComplete}
              </p>
            </div>
          )}

          {/* Game over */}
          {fightState === "game-over" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="border-2 border-alert p-6">
                <p className="font-condensed text-3xl text-alert uppercase animate-[pulse-alert_500ms_step-end_infinite]">
                  {UI.challengeFailed}
                </p>
              </div>
              <p className="font-mono text-xs text-text-dead">
                {failures}/{BOSS_MAX_FAILURES} {UI.bossFailures.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </div>
    </ScreenShell>
  );
}
