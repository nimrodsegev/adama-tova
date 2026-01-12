/**
 * STATIC MODE BEHAVIOR
 * Controls minimal/frozen state for background decoration
 */

export interface StaticConfig {
  allowMinimalMovement: boolean; // Should there be tiny movement?
  breathingAmount: number; // If movement allowed, how much? (0-0.1)
  noiseAmount: number; // Tiny organic variation (0-0.1)
}

// Default static behavior settings
export const STATIC_BEHAVIOR: StaticConfig = {
  allowMinimalMovement: true, // Very subtle movement
  breathingAmount: 0.02, // 2% size variation
  noiseAmount: 0.01, // 1% noise variation
};

/**
 * Calculate static mode scale
 * Creates minimal movement or completely frozen
 *
 * @param time Current animation time
 * @param config Static configuration
 * @returns Scale factor (very close to 1.0)
 */
export function getStaticScale(
  time: number,
  config: StaticConfig = STATIC_BEHAVIOR
): number {
  if (!config.allowMinimalMovement || config.breathingAmount === 0) {
    return 1.0; // Completely frozen
  }

  // Very slow, barely noticeable breathing
  const breathCycle = Math.sin(time * 0.2); // Very slow cycle

  return 1.0 + breathCycle * config.breathingAmount;
}

/**
 * Calculate static noise variation
 * Adds tiny organic variation to prevent perfect stillness
 *
 * @param config Static configuration
 * @returns Noise multiplier
 */
export function getStaticNoiseAmount(
  config: StaticConfig = STATIC_BEHAVIOR
): number {
  return config.noiseAmount;
}

/**
 * Create completely frozen state
 */
export function createFrozenStatic(): StaticConfig {
  return {
    allowMinimalMovement: false,
    breathingAmount: 0,
    noiseAmount: 0,
  };
}

/**
 * Create subtle movement state
 */
export function createSubtleStatic(): StaticConfig {
  return {
    allowMinimalMovement: true,
    breathingAmount: 0.03,
    noiseAmount: 0.02,
  };
}

/**
 * CUSTOMIZATION GUIDE
 *
 * For completely frozen circles:
 * - Set allowMinimalMovement: false
 * - Or use createFrozenStatic()
 *
 * For barely noticeable movement:
 * - Set breathingAmount: 0.01
 * - Set noiseAmount: 0.005
 *
 * For more visible (but still calm) movement:
 * - Set breathingAmount: 0.05
 * - Set noiseAmount: 0.03
 *
 * When to use static mode:
 * - Completed actions (success/done state)
 * - Background decoration (non-interactive)
 * - Paused states
 * - Content that needs calm background
 *
 * Static vs Breathing:
 * - Static: Almost no movement, decorative
 * - Breathing: Clear rhythm, engaging
 */
