/**
 * BREATHING PARAMETERS CALCULATOR
 * Maps user profile characteristics to breathing circle parameters
 */

export interface BreathingParams {
  speed: number; // 0-10: How fast the breathing is
  complexity: number; // 0-10: Shape complexity (organic-ness)
  smoothness: number; // 0-10: Curve smoothness
  layers: number; // Number of circles
}

interface UserProfile {
  gender?: "male" | "female" | "neutral" | "prefer_not_to_say" | null;
  quiz?: {
    interests?: string[];
  };
}

/**
 * Calculate breathing parameters based on user profile
 */
export function calculateBreathingParams(
  userProfile: UserProfile | null,
  registeredActivitiesCount: number = 0
): BreathingParams {
  // Default values (neutral/balanced)
  let speed = 5;
  let complexity = 5;
  let smoothness = 5;
  let layers = 10;

  if (!userProfile) {
    return { speed, complexity, smoothness, layers };
  }

  // 1️⃣ GENDER-BASED DEFAULTS
  const gender = userProfile.gender;

  if (gender === "male") {
    // More angular, dynamic, faster
    speed = 7; // Faster breathing (range: 6-8)
    complexity = 4; // Less organic, more geometric (range: 3-5)
    smoothness = 3; // More angular (range: 2-4)
  } else if (gender === "female") {
    // More fluid, gentle, organic
    speed = 3; // Slower breathing (range: 2-4)
    complexity = 7; // More organic shapes (range: 6-8)
    smoothness = 8; // Very smooth curves (range: 7-9)
  } else if (gender === "neutral") {
    // Balanced, harmonious
    speed = 5;
    complexity = 6;
    smoothness = 6;
  } else {
    // prefer_not_to_say or null - use balanced defaults
    speed = 5;
    complexity = 5;
    smoothness = 5;
  }

  // 2️⃣ INTEREST-BASED MODIFIERS
  const interests = userProfile.quiz?.interests || [];

  // Active/energetic interests increase speed and reduce smoothness
  const energeticInterests = ["יוגה", "Yoga"];
  const hasEnergeticInterests = interests.some((i) =>
    energeticInterests.includes(i)
  );

  if (hasEnergeticInterests) {
    speed += 1; // More dynamic
    smoothness -= 1; // Slightly less smooth
  }

  // Calm/meditative interests decrease speed and increase smoothness
  const calmInterests = ["מדיטציה", "Meditation", "מינדפולנס", "Mindfulness"];
  const hasCalmInterests = interests.some((i) => calmInterests.includes(i));

  if (hasCalmInterests) {
    speed -= 1; // Slower, more calming
    smoothness += 1; // Smoother transitions
  }

  // Creative interests increase complexity
  const creativeInterests = [
    "אומנות",
    "Art",
    "כתיבה",
    "Writing",
    "יצירה",
    "Crafts",
  ];
  const hasCreativeInterests = interests.some((i) =>
    creativeInterests.includes(i)
  );

  if (hasCreativeInterests) {
    complexity += 1; // More organic, complex shapes
  }

  // 3️⃣ TIME-OF-DAY MODIFIER
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 12) {
    // Morning: More energetic
    speed += 0.5;
  } else if (currentHour >= 18 && currentHour < 22) {
    // Evening: Calmer
    speed -= 0.5;
    smoothness += 0.5;
  } else if (currentHour >= 22 || currentHour < 6) {
    // Night: Very calm
    speed -= 1;
    smoothness += 1;
  }

  // 4️⃣ ACTIVITY LEVEL (affects layers)
  // More activities = more circles (engagement level)
  if (registeredActivitiesCount === 0) {
    layers = 5; // Default - no activities
  } else if (registeredActivitiesCount === 1) {
    layers = 6; // First activity
  } else if (registeredActivitiesCount === 2) {
    layers = 8; // Second activity (+2)
  } else if (registeredActivitiesCount === 3) {
    layers = 10; // Third activity (+2)
  } else {
    layers = 12; // Four or more activities (+2, max)
  }

  // 5️⃣ CLAMP VALUES TO VALID RANGES
  speed = Math.max(1, Math.min(10, speed));
  complexity = Math.max(0, Math.min(10, complexity));
  smoothness = Math.max(0, Math.min(10, smoothness));
  layers = Math.max(4, Math.min(12, layers)); // ✅ Max 12 layers

  return {
    speed: Math.round(speed * 10) / 10, // Round to 1 decimal
    complexity: Math.round(complexity * 10) / 10,
    smoothness: Math.round(smoothness * 10) / 10,
    layers: Math.round(layers),
  };
}

/**
 * Get a description of the breathing style based on parameters
 */
export function getBreathingStyleDescription(params: BreathingParams): string {
  const { speed, complexity, smoothness } = params;

  let style = "";

  // Speed description
  if (speed >= 7) style += "דינמי ומלא אנרגיה";
  else if (speed >= 5) style += "מאוזן ומרגיע";
  else if (speed >= 3) style += "איטי ומרגיע";
  else style += "מאוד איטי ומדיטטיבי";

  style += ", ";

  // Complexity description
  if (complexity >= 7) style += "צורות אורגניות ומורכבות";
  else if (complexity >= 4) style += "צורות מאוזנות";
  else style += "צורות גיאומטריות פשוטות";

  style += ", ";

  // Smoothness description
  if (smoothness >= 7) style += "זרימה חלקה ורכה";
  else if (smoothness >= 4) style += "זרימה טבעית";
  else style += "זרימה דינמית עם זוויות";

  return style;
}

/**
 * Example usage and testing
 */
export function exampleUsage() {
  // Male user example
  const maleProfile = {
    gender: "male" as const,
    quiz: {
      interests: ["יוגה", "כתיבה"],
    },
  };
  const maleParams = calculateBreathingParams(maleProfile, 3);
  console.log("Male user:", maleParams);
  console.log("Style:", getBreathingStyleDescription(maleParams));
  // Expected: speed ~8, complexity ~5, smoothness ~2, layers ~10 (3 activities)

  // Female user example
  const femaleProfile = {
    gender: "female" as const,
    quiz: {
      interests: ["מדיטציה", "אומנות"],
    },
  };
  const femaleParams = calculateBreathingParams(femaleProfile, 5);
  console.log("Female user:", femaleParams);
  console.log("Style:", getBreathingStyleDescription(femaleParams));
  // Expected: speed ~2, complexity ~8, smoothness ~9, layers ~12 (5+ activities = max)

  // Neutral user example
  const neutralProfile = {
    gender: "neutral" as const,
    quiz: {
      interests: ["כתיבה"],
    },
  };
  const neutralParams = calculateBreathingParams(neutralProfile, 2);
  console.log("Neutral user:", neutralParams);
  console.log("Style:", getBreathingStyleDescription(neutralParams));
  // Expected: speed ~5, complexity ~7, smoothness ~6, layers ~8 (2 activities)
}
