/**
 * MODE CONFIGURATIONS
 * Each mode has its own settings that control how it looks and behaves
 */

export interface ModeConfig {
  // Visual parameters
  radius: number; // Base size (0-1 range, multiplied by screen size)
  amplitude: number; // Breathing/movement depth (0-0.2)
  speed: number; // How fast the organic noise moves (was noiseSpeed, 0-10 scale)
  complexity: number; // How organic/wobbly the shape is (0-10 scale)
  smoothness: number; // How smooth the curves are (0-10 scale)
  opacity: number; // Base transparency (0-1)

  // Spacing & Layers
  layers: number; // Number of circle layers (3-7)
  layerSpacing: number; // How far apart each circle is (0.1-0.5)
  opacityFade: number; // How much opacity decreases per layer (0-0.3)
}

// ==========================================
// 🎉 SPLASH MODE - App Entry Animation
// ==========================================
// Builds circles one by one, slowly and smoothly
// Use for: Welcome screens, app entry, onboarding

export const SPLASH_CONFIG: ModeConfig = {
  radius: 0.15,
  amplitude: 0.01, // Very minimal movement during build
  speed: 3, // Slow, calm animation (0-10 scale)
  complexity: 2, // Low = rounder, simpler circles (0-10 scale)
  smoothness: 8.5, // High = no sharp angles, smooth curves (0-10 scale)
  opacity: 0.6, // Clearly visible

  layers: 4, // Number of circle layers
  layerSpacing: 0.25, // Good separation between circles
  opacityFade: 0.12, // Gradual fade per layer
};

// ==========================================
// 🫁 BREATHING MODE - Default Idle State
// ==========================================
// Continuous rhythmic expansion and contraction
// Simulates natural breathing with organic shapes
// Use for: Background decoration, default state, calm moments

export const BREATHING_CONFIG: ModeConfig = {
  radius: 0.15,
  amplitude: 0.15, // Moderate breathing motion (expand/contract)
  speed: 6, // Moderate speed for natural rhythm (0-10 scale)

  complexity: 0,
  smoothness: 0,
  opacity: 0,

  layers: 0,
  layerSpacing: 0,
  opacityFade: 0,
};

// ==========================================
// ⏳ LOADING MODE - Processing State
// ==========================================
// Fast, subtle movement while waiting
// Use for: Loading screens, async operations

export const LOADING_CONFIG: ModeConfig = {
  radius: 0.15,
  amplitude: 0.01, // Minimal breathing
  speed: 6, // Fast movement = active (0-10 scale)

  complexity: 0,
  smoothness: 0,
  opacity: 0,

  layers: 0,
  layerSpacing: 0,
  opacityFade: 0,
};

// ==========================================
// 💧 SPOUTING MODE - Water/Celebration
// ==========================================
// Continuous ripples emerging from center
// Use for: Success states, celebrations, data flow

export const SPOUTING_CONFIG: ModeConfig = {
  radius: 0.15, // Larger circles
  amplitude: 0.0, // No breathing (just flowing)
  speed: 4, // Moderate flow (0-10 scale)

  complexity: 0,
  smoothness: 0,
  opacity: 0,

  layers: 0,
  layerSpacing: 0,
  opacityFade: 0,
};

// ==========================================
// 🎨 STATIC MODE - Minimal Background
// ==========================================
// Barely moving, subtle decoration
// Use for: Completed states, calm backgrounds

export const STATIC_CONFIG: ModeConfig = {
  radius: 0.15,
  amplitude: 0.0, // No movement
  speed: 0, // Frozen (0-10 scale)

  complexity: 0,
  smoothness: 0,
  opacity: 0,

  layers: 0,
  layerSpacing: 0,
  opacityFade: 0,
};

// ==========================================
// MODE CONFIG LOOKUP
// ==========================================
export const MODE_CONFIGS = {
  splash: SPLASH_CONFIG,
  breathing: BREATHING_CONFIG,
  loading: LOADING_CONFIG,
  spouting: SPOUTING_CONFIG,
  static: STATIC_CONFIG,
};

export type MotionMode = keyof typeof MODE_CONFIGS;

// ==========================================
// HELPER: Get config for a mode
// ==========================================
export function getModeConfig(mode: MotionMode): ModeConfig {
  return MODE_CONFIGS[mode];
}

// ==========================================
// HELPER: Override config with custom values
// ==========================================
export function overrideModeConfig(
  mode: MotionMode,
  overrides: Partial<ModeConfig>
): ModeConfig {
  return {
    ...MODE_CONFIGS[mode],
    ...overrides,
  };
}
