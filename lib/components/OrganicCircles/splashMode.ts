/**
 * SPLASH MODE BEHAVIOR
 * Controls how splash mode builds layer by layer
 */

export interface SplashState {
  splashProgress: number; // 0 to 1, controls which layers are visible
}

export interface SplashConfig {
  buildSpeed: number; // How fast to build (0.1 = slow, 0.5 = fast)
  loopOnComplete: boolean; // Should it restart after completing?
}

// Default splash behavior settings
export const SPLASH_BEHAVIOR: SplashConfig = {
  buildSpeed: 0.15, // ~6.5 seconds to complete (slow, welcoming)
  loopOnComplete: false, // Restart after completing
};

/**
 * Update splash progress (called each frame)
 * @param state Current splash state
 * @param dt Delta time (time since last frame)
 * @param config Splash behavior config
 * @param onComplete Callback when splash completes
 * @returns Updated state
 */
export function updateSplashProgress(
  state: SplashState,
  dt: number,
  config: SplashConfig = SPLASH_BEHAVIOR,
  onComplete?: () => void
): SplashState {
  const newProgress = state.splashProgress + dt * config.buildSpeed;

  // Check if completed
  if (newProgress >= 1) {
    if (onComplete) {
      onComplete();
    }

    // Loop or stop
    return {
      splashProgress: config.loopOnComplete ? 0 : 1,
    };
  }

  return {
    splashProgress: newProgress,
  };
}

/**
 * Calculate layer visibility based on splash progress
 * Each layer fades in smoothly during its time window
 *
 * @param layerIndex Which layer (0, 1, 2, 3...)
 * @param totalLayers Total number of layers
 * @param progress Current splash progress (0-1)
 * @returns Visibility (0 = invisible, 1 = fully visible)
 */
export function getSplashLayerVisibility(
  layerIndex: number,
  totalLayers: number,
  progress: number
): number {
  // Each layer gets an equal time window
  const layerStart = layerIndex / totalLayers;
  const layerEnd = (layerIndex + 1) / totalLayers;

  // Before layer's time window
  if (progress < layerStart) {
    return 0;
  }

  // After layer's time window (fully visible)
  if (progress >= layerEnd) {
    return 1;
  }

  // During layer's time window (fading in)
  const layerProgress = (progress - layerStart) / (layerEnd - layerStart);

  // Smoothstep easing for natural fade-in
  // Formula: t² × (3 - 2t)
  return layerProgress * layerProgress * (3 - 2 * layerProgress);
}

/**
 * Reset splash to beginning
 */
export function resetSplash(): SplashState {
  return {
    splashProgress: 0,
  };
}

/**
 * CUSTOMIZATION GUIDE
 *
 * To make splash faster:
 * - Increase buildSpeed (0.3 for ~3 seconds)
 *
 * To make splash slower:
 * - Decrease buildSpeed (0.1 for ~10 seconds)
 *
 * To make it build once and stop:
 * - Set loopOnComplete: false
 *
 * To change layer fade-in:
 * - Modify getSplashLayerVisibility() easing formula
 * - Current: smoothstep (smooth start and end)
 * - Linear: return layerProgress
 * - Ease-in: return layerProgress * layerProgress
 * - Ease-out: return 1 - (1 - layerProgress) * (1 - layerProgress)
 */
