/**
 * ORGANIC CIRCLES MOTION PARAMETERS CALCULATOR
 * Controls shape parameters based on user profile.
 * All outputs are in Engine-native ranges.
 */

export interface ShapeParams {
  layers: number;
  smoothness: number; // 0.0 to 1.0
  complexity: number; // 0.0 to 5.0
  elongation: number; // 1.0 to 2.0
  opacity: number; // 0.0 to 1.0
  strokeWidth: number; // 0.5 to 3.0 (pixels)
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

const DEFAULTS: ShapeParams = {
  layers: 4,
  smoothness: 0.8,
  complexity: 0.3,
  elongation: 1.0,
  opacity: 0.8,
  strokeWidth: 1.0,
};

// 1. INTERESTS (Direct English Keys)
const INTEREST_ADJUSTMENTS: Record<
  string,
  Partial<ShapeParams> & { layersIncrease?: number }
> = {
  mindfulness: { elongation: 1.4, smoothness: 1.0, layersIncrease: 1 },
  body_motion: { complexity: 0.6, smoothness: 0.5, layersIncrease: 1 },
  music_sound: { smoothness: 0.0, layersIncrease: 1 },
  creation_material: {
    complexity: 0.7,
    elongation: 0.8,
    strokeWidth: 0.7,
    layersIncrease: 1,
  },
};

// 2. CIRCLES (Hebrew Mapping Logic)
const CIRCLE_ADJUSTMENTS: Record<
  string,
  Partial<ShapeParams> & { layersMax?: boolean; layersIncrease?: number }
> = {
  "Nova Survivor": { strokeWidth: 1.5, opacity: 0.6, complexity: 0.6 },
  "Rescue Forces": { smoothness: 1.0, strokeWidth: 3.0, opacity: 0.9 },
  "Area/Bereavement": { layersMax: true },
  "Support Group": { layersIncrease: 1 },
};

function mapCircleToType(circle: string | undefined): string | null {
  if (!circle) return null;
  const map: Record<string, string> = {
    "שורדי ושורדות המסיבות": "Nova Survivor",
    "מעגל שני ושלישי של משפחות השכול": "Support Group",
    "משפחות וקרובים של פצועים טראומה בגופם ובנפשם": "Support Group",
    "כוחות הצלה וחילוץ": "Rescue Forces",
    "נפגעי טראומה 7.10 ומלחמת חרבות ברזל": "Area/Bereavement",
    "הורים שכולים": "Area/Bereavement",
    "אחים.ות שכולים": "Area/Bereavement",
    "תושבי העוטף ומפונים": "Area/Bereavement",
  };
  return map[circle] || null;
}

export function calculateShapeParams(
  userProfile: UserProfile | null
): ShapeParams {
  if (!userProfile) return { ...DEFAULTS };

  const vals: Record<keyof Omit<ShapeParams, "layers">, number[]> = {
    smoothness: [DEFAULTS.smoothness],
    complexity: [DEFAULTS.complexity],
    elongation: [DEFAULTS.elongation],
    opacity: [DEFAULTS.opacity],
    strokeWidth: [DEFAULTS.strokeWidth],
  };

  let layersInc = 0;
  let layersMax = false;

  // 1. Process Interests (Direct lookup)
  (userProfile.quiz?.interests || []).forEach((interest) => {
    const adj = INTEREST_ADJUSTMENTS[interest];
    if (adj) {
      if (adj.smoothness !== undefined) vals.smoothness.push(adj.smoothness);
      if (adj.complexity !== undefined) vals.complexity.push(adj.complexity);
      if (adj.elongation !== undefined) vals.elongation.push(adj.elongation);
      if (adj.strokeWidth !== undefined) vals.strokeWidth.push(adj.strokeWidth);
      if (adj.opacity !== undefined) vals.opacity.push(adj.opacity);
      if (adj.layersIncrease) layersInc += adj.layersIncrease;
    }
  });

  // 2. Process Circle (Mapped lookup)
  const circleType = mapCircleToType(userProfile.quiz?.circle);
  if (circleType) {
    const cAdj = CIRCLE_ADJUSTMENTS[circleType];
    if (cAdj) {
      if (cAdj.smoothness !== undefined) vals.smoothness.push(cAdj.smoothness);
      if (cAdj.complexity !== undefined) vals.complexity.push(cAdj.complexity);
      if (cAdj.elongation !== undefined) vals.elongation.push(cAdj.elongation);
      if (cAdj.strokeWidth !== undefined)
        vals.strokeWidth.push(cAdj.strokeWidth);
      if (cAdj.opacity !== undefined) vals.opacity.push(cAdj.opacity);
      if (cAdj.layersMax) layersMax = true;
      if (cAdj.layersIncrease) layersInc += cAdj.layersIncrease;
    }
  }

  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

  return {
    layers: layersMax
      ? 7
      : Math.max(4, Math.min(7, DEFAULTS.layers + layersInc)),
    smoothness: Math.max(0, Math.min(1, avg(vals.smoothness))),
    complexity: Math.max(0, Math.min(5, avg(vals.complexity))),
    elongation: Math.max(0.5, Math.min(3, avg(vals.elongation))),
    opacity: Math.max(0, Math.min(1, avg(vals.opacity))),
    strokeWidth: Math.max(0.5, Math.min(5, avg(vals.strokeWidth))),
  };
}
