"use client";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

// Simplex noise implementation (from the HTML)
class SimplexNoise {
  grad3: number[][];
  p: number[];
  perm: number[];

  constructor() {
    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1],
    ];
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  dot(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y;
  }

  noise(xin: number, yin: number) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.perm[ii + this.perm[jj]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }
    return 70.0 * (n0 + n1 + n2);
  }

  fbm(x: number, y: number, octaves: number) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise(x * frequency, y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value;
  }
}

export interface BreathingCirclesRef {
  triggerInhale: () => void;
  triggerExhale: () => void;
  startContinuousBreathing: () => void;
  stopBreathing: () => void;
  updateLayers: (count: number) => void;
}

interface BreathingCirclesProps {
  // User profile settings (0-10 scale)
  speed?: number; // How fast the breathing/animations are
  complexity?: number; // How complex the shape is (0=circle, 10=very organic)
  smoothness?: number; // How smooth the curves are (0=bumpy, 10=smooth)

  // Visual settings
  layers?: number; // Number of circles (default: 10)
  opacity?: number; // Opacity of circles (0-1, default: 0.6)
  thickness?: number; // Thickness of strokes (0-1, default: 0.5)

  // Position and size
  position?: { x: number; y: number }; // Position as percentage (0-1)
  size?: number; // Size multiplier (default: 0.25 = 25% of screen)

  // Colors
  colors?: string[]; // Array of colors to cycle through

  // Behavior
  startBreathing?: boolean; // Start with continuous breathing (default: true)
}

const BreathingCircles = forwardRef<BreathingCirclesRef, BreathingCirclesProps>(
  (
    {
      speed = 5,
      complexity = 5,
      smoothness = 5,
      layers = 10,
      opacity = 0.6,
      thickness = 0.5,
      position = { x: 0.15, y: 0.15 }, // Top left by default
      size = 0.25,
      startBreathing = true, // ✅ Default to breathing
      colors = [
        "rgba(189, 161, 201, 0.9)",
        "rgba(173, 78, 52, 0.85)",
        "rgba(212, 137, 106, 0.8)",
        "rgba(255, 245, 245, 0.75)",
      ],
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const engineRef = useRef<any>(null);

    useEffect(() => {
      if (!svgRef.current) return;

      const noise = new SimplexNoise();
      const ns = "http://www.w3.org/2000/svg";

      class BreathingHaloEngine {
        svg: SVGSVGElement;
        paths: SVGPathElement[] = [];
        breathPhase = 0;
        breathMode: "static" | "breathing" | "inhale" | "exhale" = "breathing"; // ✅ Changed from 'static' to 'breathing'
        oneShotBreathActive = false;
        oneShotBreathProgress = 0;
        oneShotBreathValue = 0;
        oneShotBreathType: "inhale" | "exhale" = "inhale";
        radiusModifier = 0;
        animationFrameId: number | null = null; // ✅ Track animation frame

        // Parameters (normalized 0-1)
        speed: number;
        complexity: number;
        smoothness: number;
        layers: number;
        opacity: number;
        thickness: number;
        sceneConfig: any;
        colors: string[];
        breathCycleTime = 4.0;

        constructor(svg: SVGSVGElement, config: any) {
          this.svg = svg;
          this.speed = config.speed / 10;
          this.complexity = config.complexity / 10;
          this.smoothness = config.smoothness / 10;
          this.layers = config.layers;
          this.opacity = config.opacity;
          this.thickness = config.thickness;
          this.colors = config.colors;

          this.sceneConfig = {
            position: config.position,
            baseSize: config.size,
            breathAmplitude: 0.12,
          };
        }

        updateParams(config: any) {
          this.speed = config.speed / 10;
          this.complexity = config.complexity / 10;
          this.smoothness = config.smoothness / 10;
          this.layers = config.layers;
          this.opacity = config.opacity;
          this.thickness = config.thickness;

          if (this.paths.length !== this.layers) {
            this.createPaths(this.layers);
          }
        }

        setBreathMode(mode: "static" | "breathing" | "inhale" | "exhale") {
          if (mode === "inhale" || mode === "exhale") {
            this.oneShotBreathActive = true;
            this.oneShotBreathProgress = 0;
            this.oneShotBreathType = mode;
            this.breathMode = "static";
          } else {
            this.breathMode = mode;
            if (mode === "static") {
              this.oneShotBreathActive = false;
              this.oneShotBreathProgress = 0;
              this.oneShotBreathValue = 0;
            }
          }
        }

        calculateOneShotBreath(progress: number, layerIndex: number) {
          if (progress <= 0) return 0;
          if (progress >= 1.0) return 0;

          const eased = this.easeBreath(Math.min(progress, 1.0));
          const amplitude = this.sceneConfig.breathAmplitude * 1.5;

          if (this.oneShotBreathType === "inhale") {
            return eased * amplitude;
          } else {
            return -eased * amplitude;
          }
        }

        updateState(dt: number) {
          const lerpSpeed = 3.0;
          this.radiusModifier +=
            (0 - this.radiusModifier) * Math.min(1, dt * lerpSpeed);

          if (this.breathMode === "breathing") {
            this.breathPhase +=
              (dt / this.breathCycleTime) * Math.PI * 2 * this.speed;
            this.breathPhase = this.breathPhase % (Math.PI * 2);
          }

          if (this.oneShotBreathActive) {
            const duration = 1.2;
            this.oneShotBreathProgress += (dt / duration) * this.speed;

            const maxLayerDelay = this.layers * 0.08 * 0.5;
            if (this.oneShotBreathProgress >= 1.0 + maxLayerDelay) {
              this.oneShotBreathActive = false;
              this.oneShotBreathProgress = 0;
              this.oneShotBreathValue = 0;
              this.breathMode = "static";
            }
          }
        }

        createPaths(num: number) {
          while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
          }
          this.paths = [];
          for (let i = 0; i < num; i++) {
            const path = document.createElementNS(ns, "path");
            this.svg.appendChild(path);
            this.paths.push(path);
          }
        }

        easeBreath(t: number) {
          return (Math.sin((t - 0.5) * Math.PI) + 1) / 2;
        }

        generateOrganicCircle(
          cx: number,
          cy: number,
          baseRadius: number,
          ringIndex: number,
          totalRings: number,
          timeOffset: number
        ) {
          const layerDelay = ringIndex * 0.08;

          let breathEffect = 0;
          if (this.breathMode === "breathing") {
            const adjustedPhase = this.breathPhase - layerDelay;
            const breathCycle = (Math.sin(adjustedPhase) + 1) / 2;
            const organicCurve = this.easeBreath(breathCycle);
            breathEffect =
              (organicCurve * 2 - 1) * this.sceneConfig.breathAmplitude;
          } else if (this.oneShotBreathActive) {
            const staggeredProgress = Math.max(
              0,
              this.oneShotBreathProgress - layerDelay * 0.5
            );
            breathEffect = this.calculateOneShotBreath(
              staggeredProgress,
              ringIndex
            );
          }

          const gestureBreath = this.radiusModifier;
          const totalRadiusScale = 1 * (1 + breathEffect + gestureBreath);
          const finalRadius = baseRadius * totalRadiusScale;

          const noiseScale = 2.0 - this.smoothness * 1.9;
          const octaves = 1;
          const radiusVariationAmount = this.complexity * 0.25;
          const numPoints = 100;

          const points = [];

          for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const rawNoise = noise.fbm(
              Math.cos(angle) * noiseScale + timeOffset,
              Math.sin(angle) * noiseScale,
              octaves
            );
            const radiusVariation = rawNoise * radiusVariationAmount;
            const r = finalRadius * (1 + radiusVariation);

            points.push({
              x: cx + Math.cos(angle) * r,
              y: cy + Math.sin(angle) * r,
            });
          }

          let d = "";
          const startMid = {
            x: (points[points.length - 1].x + points[0].x) / 2,
            y: (points[points.length - 1].y + points[0].y) / 2,
          };
          d += `M ${startMid.x} ${startMid.y} `;

          for (let i = 0; i < points.length; i++) {
            const p0 = points[i];
            const p1 = points[(i + 1) % points.length];
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            d += `Q ${p0.x} ${p0.y} ${midX} ${midY} `;
          }
          d += "Z";

          return d;
        }

        draw() {
          const dt = 0.016;
          this.updateState(dt);

          const bounds = this.svg.getBoundingClientRect();
          const cx = bounds.width * this.sceneConfig.position.x;
          const cy = bounds.height * this.sceneConfig.position.y;
          const screenSize = Math.min(bounds.width, bounds.height);
          const baseRadius = screenSize * this.sceneConfig.baseSize;

          const actualRings = this.layers;

          if (this.paths.length !== actualRings) {
            this.createPaths(actualRings);
          }

          for (let i = 0; i < actualRings; i++) {
            const t = i / actualRings;
            const ringRadius = baseRadius * (0.35 + t * 0.75);
            const timeOffset = i * 10;

            const pathData = this.generateOrganicCircle(
              cx,
              cy,
              ringRadius,
              i,
              actualRings,
              timeOffset
            );

            const colorIdx = i % this.colors.length;
            const baseOpacity =
              this.opacity * (0.8 + Math.sin(t * Math.PI) * 0.2);
            const thicknessBase = 0.5 + this.thickness * 2.5;
            const thicknessVar = thicknessBase * (0.8 + t * 0.4);

            this.paths[i].setAttribute("d", pathData);
            this.paths[i].setAttribute("stroke", this.colors[colorIdx]);
            this.paths[i].setAttribute("stroke-opacity", String(baseOpacity));
            this.paths[i].setAttribute("stroke-width", String(thicknessVar));
            this.paths[i].setAttribute("fill", "none");
          }

          this.animationFrameId = requestAnimationFrame(() => this.draw());
        }

        start() {
          this.createPaths(this.layers);
          this.draw();
        }

        stop() {
          if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
        }
      }

      const engine = new BreathingHaloEngine(svgRef.current, {
        speed,
        complexity,
        smoothness,
        layers,
        opacity,
        thickness,
        position,
        size,
        colors,
      });

      engineRef.current = engine;

      // ✅ Force breathing mode to start immediately
      engine.breathMode = "breathing";
      engine.start();

      // ✅ Extra safety: ensure breathing after a brief delay
      setTimeout(() => {
        if (engineRef.current) {
          engineRef.current.breathMode = "breathing";
        }
      }, 100);

      return () => {
        // Cleanup - stop animation loop
        engine.stop();
        engineRef.current = null;
      };
    }, []); // ✅ Empty dependency array - only run once on mount

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      triggerInhale: () => {
        if (engineRef.current) {
          engineRef.current.setBreathMode("inhale");
        }
      },
      triggerExhale: () => {
        if (engineRef.current) {
          engineRef.current.setBreathMode("exhale");
        }
      },
      startContinuousBreathing: () => {
        if (engineRef.current) {
          engineRef.current.setBreathMode("breathing");
        }
      },
      stopBreathing: () => {
        if (engineRef.current) {
          engineRef.current.setBreathMode("static");
        }
      },
      updateLayers: (count: number) => {
        if (engineRef.current) {
          engineRef.current.layers = count;
          engineRef.current.createPaths(count);
        }
      },
    }));

    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
        shapeRendering="geometricPrecision"
      />
    );
  }
);

BreathingCircles.displayName = "BreathingCircles";

export default BreathingCircles;
