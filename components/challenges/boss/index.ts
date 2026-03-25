// =============================================================================
// Boss Action Components - Barrel export + shared types
// =============================================================================

export { default as DoubleStrikeAction } from "./double-strike-action";
export { default as WarCryAction } from "./war-cry-action";
export { default as HoldPositionAction } from "./hold-position-action";
export { default as QuickComboAction } from "./quick-combo-action";
export { default as TacticalSilenceAction } from "./tactical-silence-action";

/** Shared props for all boss action components */
export type BossActionComponentProps = {
  /** Adjusted duration in seconds (scaled by phase) */
  duration: number;
  /** Called when the player successfully completes the action */
  onSuccess: () => void;
  /** Called when the player fails the action */
  onFailure: () => void;
};
