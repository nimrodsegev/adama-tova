export interface ModeConfig {
  speed: number;
  amplitude: number;
  elongation: number;
}

export const SPLASH_CONFIG: ModeConfig & {
  radius: number;
  opacity: number;
  layers: number;
  complexity: number;
  smoothness: number;
} = {
  speed: 0.6,
  amplitude: 0.05,
  elongation: 1.05,
  radius: 0.16,
  opacity: 0.6,
  layers: 4,
  complexity: 0.6, // Control Splash wiggliness here
  smoothness: 0.99, // Control Splash smoothness here
};

export const BREATHING_CONFIG: ModeConfig = {
  speed: 1.2,
  amplitude: 0.12,
  elongation: 1.0,
};

export const LOADING_CONFIG: ModeConfig = {
  speed: 1.2,
  amplitude: 0.01,
  elongation: 1.0,
};

export const SPOUTING_CONFIG: ModeConfig = {
  speed: 0.8,
  amplitude: 0.0,
  elongation: 1.0,
};

export const STATIC_CONFIG: ModeConfig = {
  speed: 0,
  amplitude: 0.0,
  elongation: 1.0,
};

export const ROLLING_CONFIG: ModeConfig = {
  speed: 1,
  amplitude: 0.08,
  elongation: 1.9,
};

export const MODE_CONFIGS = {
  splash: SPLASH_CONFIG,
  breathing: BREATHING_CONFIG,
  loading: LOADING_CONFIG,
  spouting: SPOUTING_CONFIG,
  static: STATIC_CONFIG,
  rolling: ROLLING_CONFIG,
};

export type MotionMode = keyof typeof MODE_CONFIGS;

export function getModeConfig(mode: MotionMode): ModeConfig {
  return MODE_CONFIGS[mode];
}
