/**
 * SPOUTING MODE BEHAVIOR
 * Controls water-like ripples emerging from center
 */

export interface SpoutingState {
  emitPhase: number; // Current emission phase (0 to infinity, loops via modulo)
}

export interface SpoutingConfig {
  emitSpeed: number; // How fast ripples emit (0.05 = slow, 0.2 = fast)
  fadeInSpeed: number; // How fast ripples appear (1-10, higher = faster)
  fadeOutPower: number; // How fast ripples disappear (1-5, higher = faster)
}

// Default spouting behavior settings
export const SPOUTING_BEHAVIOR: SpoutingConfig = {
  emitSpeed: 0.2, // Moderate flow (one full cycle ~10 seconds)
  fadeInSpeed: 8, // Quick appearance
  fadeOutPower: 5, // Cubic fade-out (natural disappearance)
};

/**
 * Update spouting phase (called each frame)
 * @param state Current spouting state
 * @param dt Delta time (time since last frame)
 * @param config Spouting behavior config
 * @returns Updated state
 */
export function updateSpoutingPhase(
  state: SpoutingState,
  dt: number,
  config: SpoutingConfig = SPOUTING_BEHAVIOR
): SpoutingState {
  return {
    emitPhase: state.emitPhase + dt * config.emitSpeed,
  };
}

/**
 * Calculate layer properties for spouting effect
 * Each layer emerges at different times creating a wave effect
 *
 * @param layerIndex Which layer (0, 1, 2, 3...)
 * @param totalLayers Total number of layers
 * @param emitPhase Current emission phase
 * @param config Spouting configuration
 * @returns { radius: number, opacity: number }
 */
export function getSpoutingLayerProps(
  layerIndex: number,
  totalLayers: number,
  emitPhase: number,
  config: SpoutingConfig = SPOUTING_BEHAVIOR
): { progress: number; opacity: number } {
  // Stagger layers: each layer starts at different time
  const layerOffset = layerIndex / totalLayers;

  // Progress loops via modulo (0 to 1, then back to 0)
  const progress = (emitPhase + layerOffset) % 1;

  // Fade in quickly at start
  const fadeIn = Math.min(progress * config.fadeInSpeed, 1);

  // Fade out as it reaches the edge (cubic for smooth disappearance)
  const fadeOut = 1 - Math.pow(progress, config.fadeOutPower);

  // Combined opacity
  const opacity = fadeOut * fadeIn;

  return {
    progress, // 0 to 1 (position in emit cycle)
    opacity, // 0 to 1 (visibility)
  };
}

/**
 * Reset spouting to beginning
 */
export function resetSpouting(): SpoutingState {
  return {
    emitPhase: 0,
  };
}

/**
 * CUSTOMIZATION GUIDE
 *
 * To make ripples emit faster:
 * - Increase emitSpeed (0.2 for faster flow)
 *
 * To make ripples emit slower (more gentle):
 * - Decrease emitSpeed (0.05 for very slow)
 *
 * To make ripples appear suddenly:
 * - Increase fadeInSpeed (15 or 20)
 *
 * To make ripples appear gradually:
 * - Decrease fadeInSpeed (3 or 4)
 *
 * To make ripples disappear faster:
 * - Increase fadeOutPower (4 or 5)
 *
 * To make ripples stay visible longer:
 * - Decrease fadeOutPower (2 or 1.5)
 *
 * Effect descriptions:
 * - emitSpeed: Frequency of new ripples
 * - fadeInSpeed: How quickly ripples become visible
 * - fadeOutPower: How they disappear (higher = quicker vanish)
 *
 * Visual metaphors:
 * - Fast emit + quick fade = Rapid drops in water
 * - Slow emit + slow fade = Gentle waves
 * - Fast emit + slow fade = Constant flow
 */
