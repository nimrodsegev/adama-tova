/**
 * BREATHING MODE BEHAVIOR
 * Controls rhythmic expansion and contraction
 */

export interface BreathingState {
  breathPhase: number; // Current position in breath cycle (radians)
  breathCycleSeconds: number; // How long one full breath takes
}

export interface BreathingConfig {
  cycleSeconds: number; // Duration of one full breath (in/out)
  minScale: number; // Minimum size (0.8 = 80% of normal)
  maxScale: number; // Maximum size (1.2 = 120% of normal)
}

// Default breathing behavior settings
export const BREATHING_BEHAVIOR: BreathingConfig = {
  cycleSeconds: 5.0, // 5 seconds per full breath (calm, meditative)
  minScale: 0.9, // Contracts to 90%
  maxScale: 1.1, // Expands to 110%
};

/**
 * Update breathing phase (called each frame)
 * @param state Current breathing state
 * @param dt Delta time (time since last frame)
 * @param config Breathing behavior config
 * @returns Updated state
 */
export function updateBreathingPhase(
  state: BreathingState,
  dt: number,
  config: BreathingConfig = BREATHING_BEHAVIOR
): BreathingState {
  const cycleSpeed = (Math.PI * 2) / config.cycleSeconds;

  return {
    breathPhase: state.breathPhase + dt * cycleSpeed,
    breathCycleSeconds: config.cycleSeconds,
  };
}

/**
 * Calculate breathing scale factor at current phase
 * Returns a value between -1 and 1 (sine wave)
 *
 * @param phase Current breath phase (radians)
 * @returns Scale factor (-1 to 1, where 0 is neutral)
 */
export function getBreathingFactor(phase: number): number {
  return Math.sin(phase);
}

/**
 * Calculate actual size multiplier based on breathing
 *
 * @param phase Current breath phase
 * @param config Breathing configuration
 * @returns Size multiplier (e.g., 0.9 to 1.1)
 */
export function getBreathingScale(
  phase: number,
  config: BreathingConfig = BREATHING_BEHAVIOR
): number {
  const factor = getBreathingFactor(phase); // -1 to 1

  // Map -1 to 1 → minScale to maxScale
  const range = config.maxScale - config.minScale;
  const midpoint = (config.minScale + config.maxScale) / 2;

  return midpoint + (factor * range) / 2;
}

/**
 * Trigger an inhale (expand)
 * Useful for interactive breathing (e.g., user action)
 */
export function triggerInhale(): BreathingState {
  return {
    breathPhase: Math.PI / 2, // Start at peak (fully expanded)
    breathCycleSeconds: BREATHING_BEHAVIOR.cycleSeconds,
  };
}

/**
 * Trigger an exhale (contract)
 * Useful for interactive breathing
 */
export function triggerExhale(): BreathingState {
  return {
    breathPhase: -Math.PI / 2, // Start at valley (fully contracted)
    breathCycleSeconds: BREATHING_BEHAVIOR.cycleSeconds,
  };
}

/**
 * Reset breathing to neutral
 */
export function resetBreathing(): BreathingState {
  return {
    breathPhase: 0,
    breathCycleSeconds: BREATHING_BEHAVIOR.cycleSeconds,
  };
}

/**
 * CUSTOMIZATION GUIDE
 *
 * To make breathing faster:
 * - Decrease cycleSeconds (3.0 for faster breathing)
 *
 * To make breathing slower (more meditative):
 * - Increase cycleSeconds (7.0 or 10.0 for very slow)
 *
 * To make breathing more pronounced:
 * - Increase maxScale (1.2 or 1.3)
 * - Decrease minScale (0.7 or 0.8)
 *
 * To make breathing subtle:
 * - Set minScale: 0.95, maxScale: 1.05
 *
 * Breathing cycle phases:
 * - 0 to π/2: Inhaling (expanding)
 * - π/2 to π: Holding (at maximum)
 * - π to 3π/2: Exhaling (contracting)
 * - 3π/2 to 2π: Holding (at minimum)
 */
