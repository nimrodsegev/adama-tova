/**
 * LOADING MODE BEHAVIOR
 * Controls fast, subtle movement for loading states
 */

export interface LoadingConfig {
  rotationSpeed: number; // How fast to rotate/move (0-2, 1 = normal)
  pulseSpeed: number; // Speed of pulsing effect (0-2, 0 = no pulse)
  subtlety: number; // How subtle (0-1, 1 = very subtle)
}

// Default loading behavior settings
export const LOADING_BEHAVIOR: LoadingConfig = {
  rotationSpeed: 1.2, // Slightly faster than normal
  pulseSpeed: 0.5, // Gentle pulse
  subtlety: 0.8, // Quite subtle (not distracting)
};

/**
 * Calculate loading animation scale
 * Creates a subtle pulsing effect
 *
 * @param time Current animation time
 * @param config Loading configuration
 * @returns Scale factor (close to 1.0)
 */
export function getLoadingPulse(
  time: number,
  config: LoadingConfig = LOADING_BEHAVIOR
): number {
  if (config.pulseSpeed === 0) {
    return 1.0; // No pulsing
  }

  // Gentle sine wave pulse
  const pulse = Math.sin(time * config.pulseSpeed * Math.PI * 2);

  // Scale down by subtlety (more subtle = smaller changes)
  const amplitude = 0.05 * (1 - config.subtlety);

  return 1.0 + pulse * amplitude;
}

/**
 * Get rotation factor for loading animation
 *
 * @param time Current animation time
 * @param config Loading configuration
 * @returns Rotation in radians
 */
export function getLoadingRotation(
  time: number,
  config: LoadingConfig = LOADING_BEHAVIOR
): number {
  return time * config.rotationSpeed;
}

/**
 * Calculate loading layer offset
 * Creates a cascading/wave effect across layers
 *
 * @param layerIndex Which layer
 * @param totalLayers Total number of layers
 * @param time Current time
 * @returns Offset value (0-1)
 */
export function getLoadingLayerOffset(
  layerIndex: number,
  totalLayers: number,
  time: number
): number {
  // Each layer slightly offset in time
  const phaseOffset = (layerIndex / totalLayers) * Math.PI * 2;

  // Gentle wave across layers
  return (Math.sin(time * 2 + phaseOffset) + 1) / 2; // 0 to 1
}

/**
 * CUSTOMIZATION GUIDE
 *
 * For faster loading animation:
 * - Increase rotationSpeed (1.5 or 2.0)
 * - Increase pulseSpeed (0.8 or 1.0)
 *
 * For slower, more calming loading:
 * - Decrease rotationSpeed (0.8 or 0.5)
 * - Decrease pulseSpeed (0.3 or 0.2)
 *
 * For more pronounced loading (less subtle):
 * - Decrease subtlety (0.5 for more visible, 0.2 for very visible)
 *
 * For very subtle loading (barely visible):
 * - Increase subtlety (0.9 or 0.95)
 *
 * To remove pulsing entirely:
 * - Set pulseSpeed: 0
 *
 * Loading states comparison:
 * - Fast + visible = Active processing
 * - Slow + subtle = Background task
 * - Medium + subtle = Standard loading (default)
 */
