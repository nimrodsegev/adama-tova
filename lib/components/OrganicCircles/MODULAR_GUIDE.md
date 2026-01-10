# 🎨 Modular OrganicCircles - Complete Guide

## 📁 New File Structure

```
OrganicCircles/
├── index.ts              → Exports everything (main entry point)
├── modeConfigs.ts        → Visual settings for each mode
├── splashMode.ts         → Splash behavior & timing
├── breathingMode.ts      → Breathing rhythm & cycle
├── spoutingMode.ts       → Spouting flow & ripples
├── loadingMode.ts        → Loading animation settings
└── staticMode.ts         → Static/frozen behavior
```

---

## 🎯 What Each File Controls

### **modeConfigs.ts** - Visual Settings

Controls **HOW CIRCLES LOOK** for each mode:

- Size (radius)
- Movement depth (amplitude)
- Organic-ness (complexity)
- Smoothness (curve smoothness)
- Transparency (opacity)
- Spacing between layers
- Opacity fade per layer

**Edit this to change:** Circle appearance, spacing, smoothness

---

### **splashMode.ts** - Splash Behavior

Controls **HOW SPLASH BUILDS**:

- Build speed (how fast layers appear)
- Loop on complete (restart or stop)
- Layer visibility calculation
- Fade-in easing

**Edit this to change:** Build timing, looping, layer appearance

---

### **breathingMode.ts** - Breathing Behavior

Controls **HOW CIRCLES BREATHE**:

- Breath cycle duration (how long one breath takes)
- Min/max scale (how much expansion/contraction)
- Breath phase calculation
- Inhale/exhale triggers

**Edit this to change:** Breathing speed, depth, rhythm

---

### **spoutingMode.ts** - Spouting Behavior

Controls **HOW RIPPLES FLOW**:

- Emit speed (how fast ripples appear)
- Fade-in speed (how quickly ripples become visible)
- Fade-out power (how ripples disappear)
- Layer staggering

**Edit this to change:** Flow speed, ripple appearance, disappearance

---

### **loadingMode.ts** - Loading Behavior

Controls **HOW LOADING ANIMATES**:

- Rotation speed
- Pulse speed (pulsing effect)
- Subtlety (how visible the animation is)

**Edit this to change:** Loading speed, visibility, intensity

---

### **staticMode.ts** - Static Behavior

Controls **MINIMAL MOVEMENT**:

- Allow minimal movement (true/false)
- Breathing amount (tiny variation)
- Noise amount (organic variation)

**Edit this to change:** Frozen vs subtle movement

---

## 🔧 How to Customize Each Mode

### Example 1: Make Splash Build Faster

**File:** `splashMode.ts`

```tsx
export const SPLASH_BEHAVIOR: SplashConfig = {
  buildSpeed: 0.3, // Change from 0.15 → builds in ~3 seconds
  loopOnComplete: true,
};
```

---

### Example 2: Make Circles More Spaced in Splash

**File:** `modeConfigs.ts`

```tsx
export const SPLASH_CONFIG: ModeConfig = {
  // ... other settings
  layerSpacing: 0.35, // Change from 0.25 → wider spacing
  opacityFade: 0.08, // Change from 0.12 → slower fade
};
```

---

### Example 3: Make Breathing Slower and Deeper

**File:** `breathingMode.ts`

```tsx
export const BREATHING_BEHAVIOR: BreathingConfig = {
  cycleSeconds: 8.0, // Change from 5.0 → slower breathing
  minScale: 0.85, // Change from 0.9 → contracts more
  maxScale: 1.15, // Change from 1.1 → expands more
};
```

---

### Example 4: Make Spouting Ripples Faster

**File:** `spoutingMode.ts`

```tsx
export const SPOUTING_BEHAVIOR: SpoutingConfig = {
  emitSpeed: 0.2, // Change from 0.1 → faster ripples
  fadeInSpeed: 12, // Change from 8 → appear faster
  fadeOutPower: 4, // Change from 3 → disappear faster
};
```

---

### Example 5: Make Loading More Subtle

**File:** `loadingMode.ts`

```tsx
export const LOADING_BEHAVIOR: LoadingConfig = {
  rotationSpeed: 0.8, // Change from 1.2 → slower
  pulseSpeed: 0.3, // Change from 0.5 → gentler pulse
  subtlety: 0.9, // Change from 0.8 → more subtle
};
```

---

### Example 6: Make Circles Smoother (No Sharp Angles)

**File:** `modeConfigs.ts`

```tsx
export const SPLASH_CONFIG: ModeConfig = {
  // ... other settings
  complexity: 0.1, // Lower = rounder
  smoothness: 0.95, // Higher = smoother curves
};
```

---

## 📊 Quick Reference: What Controls What

| Want to Change        | File               | Parameter              |
| --------------------- | ------------------ | ---------------------- |
| Circle spacing        | `modeConfigs.ts`   | `layerSpacing`         |
| Sharp angles → smooth | `modeConfigs.ts`   | `smoothness`           |
| Too organic → rounder | `modeConfigs.ts`   | `complexity`           |
| Splash build speed    | `splashMode.ts`    | `buildSpeed`           |
| Splash looping        | `splashMode.ts`    | `loopOnComplete`       |
| Breathing speed       | `breathingMode.ts` | `cycleSeconds`         |
| Breathing depth       | `breathingMode.ts` | `minScale`, `maxScale` |
| Spouting speed        | `spoutingMode.ts`  | `emitSpeed`            |
| Ripple lifetime       | `spoutingMode.ts`  | `fadeOutPower`         |
| Loading visibility    | `loadingMode.ts`   | `subtlety`             |
| Static movement       | `staticMode.ts`    | `allowMinimalMovement` |

---

## 🎯 Common Customization Scenarios

### Scenario 1: "Splash circles overlap"

**Files to edit:** `modeConfigs.ts`

```tsx
SPLASH_CONFIG: {
  layerSpacing: 0.35,     // ⬆️ Increase spacing
  complexity: 0.15,       // ⬇️ Make rounder
}
```

---

### Scenario 2: "Splash has sharp angles"

**Files to edit:** `modeConfigs.ts`

```tsx
SPLASH_CONFIG: {
  smoothness: 0.9,        // ⬆️ More smooth
  complexity: 0.1,        // ⬇️ Less organic
}
```

---

### Scenario 3: "Splash builds too slow"

**Files to edit:** `splashMode.ts`

```tsx
SPLASH_BEHAVIOR: {
  buildSpeed: 0.3,        // ⬆️ Faster (was 0.15)
}
```

---

### Scenario 4: "Breathing too fast/anxious"

**Files to edit:** `breathingMode.ts`

```tsx
BREATHING_BEHAVIOR: {
  cycleSeconds: 7.0,      // ⬆️ Slower, more calm
  minScale: 0.95,         // Less pronounced
  maxScale: 1.05,
}
```

---

### Scenario 5: "Loading too distracting"

**Files to edit:** `loadingMode.ts`

```tsx
LOADING_BEHAVIOR: {
  rotationSpeed: 0.6,     // ⬇️ Slower
  subtlety: 0.95,         // ⬆️ More subtle
}
```

---

## 🔄 How to Use in Your App

### Import and Use Defaults

```tsx
import {
  SPLASH_CONFIG,
  BREATHING_CONFIG,
} from "@/lib/components/OrganicCircles";

// Configs are automatically used by OrganicCircles component
<OrganicCircles mode="splash" />;
```

### Override Specific Values

```tsx
import { overrideModeConfig } from "@/lib/components/OrganicCircles";

const customSplash = overrideModeConfig("splash", {
  layerSpacing: 0.35, // Override just this
  smoothness: 0.9, // And this
});

// Pass to component (when we update the main component to support this)
```

### Access Behavior Functions

```tsx
import {
  getSplashLayerVisibility,
  getBreathingScale,
} from "@/lib/components/OrganicCircles";

// Calculate layer visibility manually
const visibility = getSplashLayerVisibility(2, 4, 0.5);

// Calculate breathing scale
const scale = getBreathingScale(Math.PI / 2);
```

---

## 📖 Reading the Code

Each file has extensive comments explaining:

- ✅ What each parameter does
- ✅ Valid ranges for values
- ✅ Customization examples
- ✅ Effect descriptions
- ✅ When to use each mode

**Just open the file and read the comments!**

Example from `splashMode.ts`:

```tsx
/**
 * CUSTOMIZATION GUIDE
 *
 * To make splash faster:
 * - Increase buildSpeed (0.3 for ~3 seconds)
 *
 * To make splash slower:
 * - Decrease buildSpeed (0.1 for ~10 seconds)
 */
```

---

## 🎨 Benefits of This Structure

### Before (Monolithic):

```
OrganicCircles.tsx (545 lines)
└── Everything mixed together
    Hard to find what controls what
```

### After (Modular):

```
OrganicCircles/
├── modeConfigs.ts     (120 lines) → Visual settings
├── splashMode.ts      (90 lines)  → Splash behavior
├── breathingMode.ts   (100 lines) → Breathing behavior
├── spoutingMode.ts    (95 lines)  → Spouting behavior
├── loadingMode.ts     (75 lines)  → Loading behavior
└── staticMode.ts      (65 lines)  → Static behavior
```

**Benefits:**

- ✅ Easy to find what you need
- ✅ Change one mode without affecting others
- ✅ Clear documentation in each file
- ✅ Reusable functions
- ✅ Type-safe configurations

---

## 🚀 Next Steps

1. **Update main OrganicCircles.tsx** to import from these files
2. **Test each mode** with new configs
3. **Customize as needed** by editing the config files
4. **Share configs** across your app

---

## 💡 Pro Tips

1. **Start with small changes** - Adjust one parameter at a time
2. **Test immediately** - See the effect of your changes
3. **Read the comments** - Each file has a customization guide
4. **Use the defaults** - They're already well-tuned
5. **Override selectively** - Only change what you need

---

**Your circles, your way!** 🎨✨
