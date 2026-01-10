/**
 * ORGANIC CIRCLES MOTION PARAMETERS CALCULATOR
 */

// Import mode configs as single source of truth
import {
  MODE_CONFIGS,
  type MotionMode,
} from "@/lib/components/OrganicCircles/modeConfigs";

export type { MotionMode };

export interface MotionParams {
  layers: number;
  smoothness: number;
  complexity: number;
  elongation: number;
  opacity: number;
  strokeWidth: number;
  speed: number;
  radius: number;
  amplitude: number;
  defaultMode: MotionMode;
}

export interface UserProfile {
  gender?: "male" | "female" | "neutral" | "prefer_not_to_say" | null;
  quiz?: {
    interests?: string[];
    circle?: string;
    branches?: string[];
    free_text?: string;
  };
  role?: "participant" | "admin";
}

// 🛠️ TypeScript Interfaces to fix the "Property does not exist" errors
interface BaseAdjustments {
  layersIncrease?: number;
  smoothness?: number;
  complexity?: number;
  elongation?: number;
  opacity?: number;
  strokeWidth?: number;
  layersMax?: boolean;
}

type InterestType =
  | "mindfulness"
  | "body_motion"
  | "music_sound"
  | "creation_material";
type CircleType =
  | "Nova Survivor"
  | "Support Group"
  | "Rescue Forces"
  | "Area/Bereavement";

/**
 * Default values
 */
const DEFAULTS = {
  layers: 4,
  smoothness: 8,
  complexity: 1,
  elongation: 10,
  opacity: 8,
  strokeWidth: 10,
};

/**
 * Interest-based adjustments - Explicitly typed to allow optional properties
 */
const INTEREST_ADJUSTMENTS: Record<InterestType, BaseAdjustments> = {
  mindfulness: {
    elongation: 14.5,
    smoothness: 10,
    layersIncrease: 1,
  },
  body_motion: {
    complexity: 3,
    smoothness: 5,
    layersIncrease: 1,
  },
  music_sound: {
    smoothness: 0,
    layersIncrease: 1,
  },
  creation_material: {
    complexity: 3,
    elongation: 8.5,
    strokeWidth: 7,
    layersIncrease: 1,
  },
};

/**
 * Circle-based adjustments - Explicitly typed
 */
const CIRCLE_ADJUSTMENTS: Record<CircleType, BaseAdjustments> = {
  "Nova Survivor": {
    strokeWidth: 15,
    opacity: 6,
  },
  "Rescue Forces": {
    smoothness: 10,
    strokeWidth: 30,
    opacity: 9,
  },
  "Area/Bereavement": {
    layersMax: true,
  },
  "Support Group": {
    layersIncrease: 1,
  },
};

/**
 * Map Hebrew interests to English types
 */
function mapInterestToType(interest: string): InterestType | null {
  const interestMap: Record<string, InterestType> = {
    מדיטציה: "mindfulness",
    Meditation: "mindfulness",
    מיינדפולנס: "mindfulness",
    Mindfulness: "mindfulness",
    הרפיה: "mindfulness",
    Relaxation: "mindfulness",
    טבע: "mindfulness",
    Nature: "mindfulness",
    יוגה: "body_motion",
    Yoga: "body_motion",
    ריצה: "body_motion",
    Running: "body_motion",
    כושר: "body_motion",
    Fitness: "body_motion",
    ספורט: "body_motion",
    Sports: "body_motion",
    ריקוד: "body_motion",
    Dance: "body_motion",
    תנועה: "body_motion",
    Movement: "body_motion",
    מוזיקה: "music_sound",
    Music: "music_sound",
    שירה: "music_sound",
    Singing: "music_sound",
    נגינה: "music_sound",
    Playing: "music_sound",
    קול: "music_sound",
    Sound: "music_sound",
    אומנות: "creation_material",
    Art: "creation_material",
    כתיבה: "creation_material",
    Writing: "creation_material",
    יצירה: "creation_material",
    Crafts: "creation_material",
    צילום: "creation_material",
    Photography: "creation_material",
    עיצוב: "creation_material",
    Design: "creation_material",
    ציור: "creation_material",
    Painting: "creation_material",
  };
  return interestMap[interest] || null;
}

function mapCircleToType(circle: string | undefined): CircleType | null {
  if (!circle) return null;
  const circleMap: Record<string, CircleType> = {
    "שורדי ושורדות המסיבות": "Nova Survivor",
    "מעגל שני ושלישי של משפחות השכול": "Support Group",
    "משפחות וקרובים של פצועים טראומה בגופם ובנפשם": "Support Group",
    "כוחות הצלה וחילוץ": "Rescue Forces",
    "נפגעי טראומה 7.10 ומלחמת חרבות ברזל": "Area/Bereavement",
    "הורים שכולים": "Area/Bereavement",
    "אחים.ות שכולים": "Area/Bereavement",
    "תושבי העוטף ומפונים": "Area/Bereavement",
  };
  return circleMap[circle] || null;
}

export function calculateMotionParams(
  userProfile: UserProfile | null,
  mode: MotionMode = "breathing"
): MotionParams {
  const modeConfig = MODE_CONFIGS[mode];

  let layers = DEFAULTS.layers;
  let smoothness = DEFAULTS.smoothness;
  let complexity = DEFAULTS.complexity;
  let elongation = DEFAULTS.elongation;
  let opacity = DEFAULTS.opacity;
  let strokeWidth = DEFAULTS.strokeWidth;

  if (!userProfile) {
    return {
      ...DEFAULTS,
      speed: modeConfig.speed,
      radius: modeConfig.radius,
      amplitude: modeConfig.amplitude,
      defaultMode: mode,
    };
  }

  const valuesToAverage: Record<string, number[]> = {
    smoothness: [DEFAULTS.smoothness],
    complexity: [DEFAULTS.complexity],
    elongation: [DEFAULTS.elongation],
    opacity: [DEFAULTS.opacity],
    strokeWidth: [DEFAULTS.strokeWidth],
  };

  let layersIncrease = 0;
  let layersSetToMax = false;

  const interests = userProfile.quiz?.interests || [];
  const userInterestTypes = new Set<InterestType>();

  interests.forEach((interest) => {
    const type = mapInterestToType(interest);
    if (type && !userInterestTypes.has(type)) {
      userInterestTypes.add(type);
      const adj = INTEREST_ADJUSTMENTS[type];
      if (adj.elongation !== undefined)
        valuesToAverage.elongation.push(adj.elongation);
      if (adj.smoothness !== undefined)
        valuesToAverage.smoothness.push(adj.smoothness);
      if (adj.complexity !== undefined)
        valuesToAverage.complexity.push(adj.complexity);
      if (adj.strokeWidth !== undefined)
        valuesToAverage.strokeWidth.push(adj.strokeWidth);
      if (adj.layersIncrease) layersIncrease += adj.layersIncrease;
    }
  });

  const circleType = mapCircleToType(userProfile.quiz?.circle);
  if (circleType) {
    const adj = CIRCLE_ADJUSTMENTS[circleType];
    if (adj.strokeWidth !== undefined)
      valuesToAverage.strokeWidth.push(adj.strokeWidth);
    if (adj.opacity !== undefined) valuesToAverage.opacity.push(adj.opacity);
    if (adj.smoothness !== undefined)
      valuesToAverage.smoothness.push(adj.smoothness);
    if (adj.layersIncrease) layersIncrease += adj.layersIncrease;
    if (adj.layersMax) layersSetToMax = true;
  }

  // Calculate Averages
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  smoothness = avg(valuesToAverage.smoothness);
  complexity = avg(valuesToAverage.complexity);
  elongation = avg(valuesToAverage.elongation);
  opacity = avg(valuesToAverage.opacity);
  strokeWidth = avg(valuesToAverage.strokeWidth);

  if (layersSetToMax) layers = 7;
  else layers = DEFAULTS.layers + layersIncrease;

  return {
    layers: Math.max(4, Math.min(7, Math.round(layers))),
    smoothness: Math.max(0, Math.min(10, Math.round(smoothness * 10) / 10)),
    complexity: Math.max(0, Math.min(50, Math.round(complexity * 10) / 10)),
    elongation: Math.max(5, Math.min(20, Math.round(elongation * 10) / 10)),
    opacity: Math.max(0, Math.min(10, Math.round(opacity * 10) / 10)),
    strokeWidth: Math.max(1, Math.min(100, Math.round(strokeWidth * 10) / 10)),
    speed: modeConfig.speed,
    radius: modeConfig.radius,
    amplitude: modeConfig.amplitude,
    defaultMode: mode,
  };
}

export function getContextualMode(
  userProfile: UserProfile | null,
  context: {
    isLoading?: boolean;
    isOnboarding?: boolean;
    isCompleting?: boolean;
    isIdle?: boolean;
  }
): MotionMode {
  if (context.isLoading) return "loading";
  if (context.isOnboarding) return "splash";
  if (context.isCompleting) return "spouting";
  if (context.isIdle) return "static";
  return "breathing";
}

export function getMotionStyleDescription(params: MotionParams): string {
  const { complexity, smoothness, strokeWidth } = params;
  let style = "";
  if (complexity >= 20) style += "צורות אורגניות ומורכבות מאוד";
  else if (complexity >= 10) style += "צורות אורגניות";
  else if (complexity >= 3) style += "צורות מאוזנות";
  else style += "צורות גיאומטריות פשוטות";
  style += ", ";
  if (smoothness >= 8) style += "זרימה חלקה ורכה";
  else if (smoothness >= 4) style += "זרימה טבעית";
  else style += "זרימה דינמית עם זוויות";
  style += ", ";
  if (strokeWidth >= 20) style += "קווים עבים ובולטים";
  else if (strokeWidth >= 10) style += "קווים מאוזנים";
  else style += "קווים דקים ועדינים";
  return style;
}
