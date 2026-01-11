/**
 * ORGANIC CIRCLES - MODULAR CONFIGURATION
 *
 * This folder contains separate files for each mode's behavior and configuration.
 * Import what you need to customize specific modes.
 */

// ==========================================
// MODE CONFIGURATIONS (Visual Settings)
// ==========================================
export {
  SPLASH_CONFIG,
  BREATHING_CONFIG,
  LOADING_CONFIG,
  SPOUTING_CONFIG,
  STATIC_CONFIG,
  MODE_CONFIGS,
  getModeConfig,
  type ModeConfig,
  type MotionMode,
} from "./modeConfigs";

// ==========================================
// SPLASH MODE (App Entry)
// ==========================================
export {
  SPLASH_BEHAVIOR,
  updateSplashProgress,
  getSplashLayerVisibility,
  resetSplash,
  type SplashState,
  type SplashConfig,
} from "./splashMode";

// ==========================================
// BREATHING MODE (Default Idle)
// ==========================================
export {
  BREATHING_BEHAVIOR,
  updateBreathingPhase,
  getBreathingFactor,
  getBreathingScale,
  triggerInhale,
  triggerExhale,
  resetBreathing,
  type BreathingState,
  type BreathingConfig,
} from "./breathingMode";

// ==========================================
// SPOUTING MODE (Water/Celebration)
// ==========================================
export {
  SPOUTING_BEHAVIOR,
  updateSpoutingPhase,
  getSpoutingLayerProps,
  resetSpouting,
  type SpoutingState,
  type SpoutingConfig,
} from "./spoutingMode";

// ==========================================
// LOADING MODE (Processing)
// ==========================================
export {
  LOADING_BEHAVIOR,
  getLoadingPulse,
  getLoadingRotation,
  getLoadingLayerOffset,
  type LoadingConfig,
} from "./loadingMode";

// ==========================================
// STATIC MODE (Minimal/Frozen)
// ==========================================
export {
  STATIC_BEHAVIOR,
  getStaticScale,
  getStaticNoiseAmount,
  createFrozenStatic,
  createSubtleStatic,
  type StaticConfig,
} from "./staticMode";
