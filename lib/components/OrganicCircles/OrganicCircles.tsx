"use client";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

// Perlin-like noise implementation
class NoiseGenerator {
  private perm: Uint8Array;

  constructor() {
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = Math.floor(Math.random() * 256);
    }
  }

  noise2D(x: number, y: number): number {
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a: number, b: number, t: number) => a + t * (b - a);
    const grad = (hash: number, x: number, y: number) => {
      const h = hash & 7;
      const u = h < 4 ? x : y;
      const v = h < 4 ? y : x;
      return (h & 1 ? -u : u) + (h & 2 ? -v : v);
    };

    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = this.perm[X] + Y;
    const B = this.perm[X + 1] + Y;

    return lerp(
      lerp(grad(this.perm[A], x, y), grad(this.perm[B], x - 1, y), u),
      lerp(
        grad(this.perm[A + 1], x, y - 1),
        grad(this.perm[B + 1], x - 1, y - 1),
        u
      ),
      v
    );
  }
}

export type MotionMode =
  | "breathing"
  | "splash"
  | "spouting"
  | "loading"
  | "static";

export interface OrganicCirclesRef {
  setMode: (mode: MotionMode) => void;
  updateLayers: (count: number) => void;
  updateParams: (params: Partial<OrganicCirclesProps>) => void;
}

export interface OrganicCirclesProps {
  // Motion mode
  mode?: MotionMode;

  // Adjustable parameters (from calculator)
  layers?: number; // 4-7 (default: 4)
  smoothness?: number; // 0-10 (default: 8)
  complexity?: number; // 0-50 (default: 1)
  elongation?: number; // 5-20 (default: 10) - NOT IMPLEMENTED YET
  opacity?: number; // 0-10 (default: 5)
  strokeWidth?: number; // 1-100 (default: 10)

  // Mode-specific (from modeConfigs.ts, not adjustable by user)
  speed?: number; // Motion speed
  radius?: number; // Base size
  amplitude?: number; // Breathing depth

  // Position and color
  position?: { x: number; y: number }; // Position as percentage (0-1, default: center)
  baseColor?: string; // Stroke color (default: white)

  // Callbacks
  onModeComplete?: (mode: MotionMode) => void;
}

const OrganicCircles = forwardRef<OrganicCirclesRef, OrganicCirclesProps>(
  (
    {
      mode = "breathing",
      layers = 4,
      smoothness = 8,
      complexity = 1,
      elongation = 10, // Not used yet, but accepted
      opacity = 5,
      strokeWidth = 10,
      speed = 5,
      radius = 0.15,
      amplitude = 0.08,
      position = { x: 0.5, y: 0.5 },
      baseColor = "#FFFFFF",
      onModeComplete,
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const engineRef = useRef<any>(null);

    useEffect(() => {
      if (!svgRef.current) return;

      const noise = new NoiseGenerator();
      const ns = "http://www.w3.org/2000/svg";

      class OrganicCirclesEngine {
        svg: SVGSVGElement;
        paths: SVGPathElement[] = [];
        width: number;
        height: number;

        // Animation State
        animState = {
          // Visual parameters (interpolated)
          radius: 0,
          amplitude: 0,
          noiseSpeed: 0,
          complexity: 0, // 0-5 internal range (maps from 0-50)
          smoothness: 0, // 0-1 internal range (maps from 0-10)
          opacity: 0, // 0-1 internal range (maps from 0-10)

          // Animation state
          time: 0,
          breathPhase: 0,
          breathCycleSeconds: 5.0,
          splashProgress: 0,
          emitPhase: 0,
        };

        // Targets for smooth interpolation
        targets: any = {};

        // Current mode
        currentMode: MotionMode = "breathing";

        // Config
        config = {
          layerCount: 4,
          baseColor: "#FFFFFF",
          strokeWidth: 10, // 1-100 range
          position: { x: 0.5, y: 0.5 },
        };

        // Mode definitions (from modeConfigs.ts)
        modes = {
          splash: {
            radius: 0.28,
            amplitude: 0.01,
            noiseSpeed: 0.3,
            complexity: 0.2,
            smoothness: 0.85,
            opacity: 0.6,
          },
          breathing: {
            radius: 0.15,
            amplitude: 0.08,
            noiseSpeed: 0.4,
            complexity: 0.5,
            smoothness: 0.5,
            opacity: 0.5,
          },
          loading: {
            radius: 0.15,
            amplitude: 0.01,
            noiseSpeed: 1.2,
            complexity: 0.2,
            smoothness: 0.9,
            opacity: 0.4,
          },
          spouting: {
            radius: 0.15,
            amplitude: 0.0,
            noiseSpeed: 0.4,
            complexity: 0.3,
            smoothness: 0.7,
            opacity: 0.7,
          },
          static: {
            radius: 0.15,
            amplitude: 0.0,
            noiseSpeed: 0.0,
            complexity: 0.3,
            smoothness: 0.8,
            opacity: 0.6,
          },
        };

        animationFrameId: number | null = null;
        onModeComplete?: (mode: MotionMode) => void;

        constructor(svg: SVGSVGElement, initialConfig: any) {
          this.svg = svg;
          this.width = window.innerWidth;
          this.height = window.innerHeight;

          // Apply initial config
          this.updateConfig(initialConfig);

          // Set initial targets
          this.targets = { ...this.modes[this.currentMode] };

          // Create paths
          this.createLayers();

          // Start animation loop
          this.animate = this.animate.bind(this);
          this.start();

          // Handle resize
          window.addEventListener("resize", this.handleResize);
        }

        handleResize = () => {
          this.width = window.innerWidth;
          this.height = window.innerHeight;
        };

        updateConfig(config: any) {
          // Update layer count
          if (config.layers !== undefined) {
            this.config.layerCount = Math.max(4, Math.min(7, config.layers));
          }

          // Update visual config
          if (config.baseColor !== undefined) {
            this.config.baseColor = config.baseColor;
          }

          // Update stroke width (1-100 range, convert to reasonable pixel value)
          if (config.strokeWidth !== undefined) {
            // Map 1-100 to 0.5-3.0 pixels for reasonable visual thickness
            this.config.strokeWidth = 0.5 + (config.strokeWidth / 100) * 2.5;
          }

          if (config.position !== undefined) {
            this.config.position = config.position;
          }

          // Update mode-specific parameters
          const currentModeConfig = { ...this.modes[this.currentMode] };

          // Mode-specific (from modeConfigs.ts)
          if (config.radius !== undefined) {
            currentModeConfig.radius = config.radius;
          }
          if (config.amplitude !== undefined) {
            currentModeConfig.amplitude = config.amplitude;
          }
          if (config.speed !== undefined) {
            const speedNormalized = config.speed / 10;
            currentModeConfig.noiseSpeed = speedNormalized * 2;
            this.animState.breathCycleSeconds =
              5.0 / Math.max(0.1, speedNormalized);
          }

          // User-adjustable parameters
          if (config.complexity !== undefined) {
            // Map 0-50 to 0-5 internal range
            currentModeConfig.complexity = config.complexity / 10;
          }
          if (config.smoothness !== undefined) {
            // Map 0-10 to 0-1 internal range
            currentModeConfig.smoothness = config.smoothness / 10;
          }
          if (config.opacity !== undefined) {
            // Map 0-10 to 0-1 internal range
            currentModeConfig.opacity = config.opacity / 10;
          }

          this.modes[this.currentMode] = currentModeConfig;
          this.targets = { ...currentModeConfig };
        }

        setMode(modeName: MotionMode) {
          if (!this.modes[modeName]) {
            console.warn(`Unknown mode: ${modeName}`);
            return;
          }

          this.currentMode = modeName;
          const modeConfig = this.modes[modeName];

          // Update targets
          this.targets = { ...modeConfig };

          // Special logic for splash - reset progress
          if (modeName === "splash") {
            Object.assign(this.animState, {
              radius: 0,
              splashProgress: 0,
            });
          } else {
            this.animState.splashProgress = 1;
          }

          // Reset emit phase for spouting
          if (modeName === "spouting") {
            this.animState.emitPhase = 0;
          }
        }

        createLayers() {
          this.svg.innerHTML = "";
          this.paths = [];

          for (let i = 0; i < this.config.layerCount; i++) {
            const path = document.createElementNS(ns, "path");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", this.config.baseColor);
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            this.svg.appendChild(path);
            this.paths.push(path);
          }
        }

        getDeformedRadius(
          angle: number,
          baseR: number,
          layerIndex: number
        ): number {
          const noiseScale = 2.5 - this.animState.smoothness * 2.0;
          const timeOff = this.animState.time * 0.5;
          const layerOff = layerIndex * 10;

          const nx = Math.cos(angle) * noiseScale + timeOff;
          const ny = Math.sin(angle) * noiseScale + layerOff;

          let n = noise.noise2D(nx, ny);
          n += 0.5 * noise.noise2D(nx * 2, ny * 2);
          n = n / 1.5;

          return baseR * (1 + n * this.animState.complexity * 0.3);
        }

        updatePhysics(dt: number) {
          const ease = 0.05;

          // Smooth interpolation
          this.animState.radius +=
            (this.targets.radius - this.animState.radius) * ease;
          this.animState.amplitude +=
            (this.targets.amplitude - this.animState.amplitude) * ease;
          this.animState.noiseSpeed +=
            (this.targets.noiseSpeed - this.animState.noiseSpeed) * ease;
          this.animState.complexity +=
            (this.targets.complexity - this.animState.complexity) * ease;
          this.animState.smoothness +=
            (this.targets.smoothness - this.animState.smoothness) * ease;
          this.animState.opacity +=
            (this.targets.opacity - this.animState.opacity) * ease;

          // Update time
          this.animState.time += dt * this.animState.noiseSpeed;

          // Splash logic - SLOW BUILD WITH LOOPING
          if (this.currentMode === "splash") {
            this.animState.splashProgress += dt * 0.15;

            // When complete, loop back to start
            if (this.animState.splashProgress >= 1) {
              this.animState.splashProgress = 0;

              if (this.onModeComplete) {
                this.onModeComplete("splash");
              }
            }
          }

          // Spouting logic - CONTINUOUS (emitPhase grows infinitely)
          if (this.currentMode === "spouting") {
            this.animState.emitPhase += dt * 0.1;
          }

          // Breathing logic
          const cycleSpeed = (Math.PI * 2) / this.animState.breathCycleSeconds;
          this.animState.breathPhase += dt * cycleSpeed;
        }

        draw() {
          const centerX = this.width * this.config.position.x;
          const centerY = this.height * this.config.position.y;
          const minDim = Math.min(this.width, this.height);

          // Breathing factor
          const breathFactor = Math.sin(this.animState.breathPhase);

          this.paths.forEach((path, i) => {
            let layerRadius: number;
            let layerOpacity: number;

            // SPOUTING MODE - FIXED FOR CONTINUOUS FLOW
            if (this.currentMode === "spouting") {
              // Each layer is offset by a fraction of the total cycle
              // This ensures layers are evenly distributed and continuous
              const layerOffset = i / this.config.layerCount;

              // Progress wraps continuously from 0 to 1 using modulo
              // This is the KEY to continuous flow - no gaps!
              const progress = (this.animState.emitPhase + layerOffset) % 1;

              // Radius grows from center outward
              layerRadius = this.animState.radius * minDim * progress;

              // Fade in quickly at start
              const fadeIn = Math.min(progress * 8, 1);

              // Fade out as it reaches edge (cubic for smooth disappearance)
              const fadeOut = 1 - Math.pow(progress, 3);

              // Combined opacity
              layerOpacity = this.animState.opacity * fadeOut * fadeIn;
            }
            // ALL OTHER MODES (breathing, splash, loading, static)
            else {
              // Splash visibility - LAYER BY LAYER
              let splashVisibility = 1;
              if (this.currentMode === "splash") {
                const layerStart = i / this.config.layerCount;
                const layerEnd = (i + 1) / this.config.layerCount;

                if (this.animState.splashProgress < layerStart) {
                  splashVisibility = 0;
                } else if (this.animState.splashProgress >= layerEnd) {
                  splashVisibility = 1;
                } else {
                  const layerProgress =
                    (this.animState.splashProgress - layerStart) /
                    (layerEnd - layerStart);
                  splashVisibility =
                    layerProgress * layerProgress * (3 - 2 * layerProgress);
                }
              }

              if (splashVisibility <= 0) {
                path.setAttribute("opacity", "0");
                return;
              }

              // Calculate radius with breathing
              const layerBaseSize =
                this.animState.radius * minDim * (1 + i * 0.25);
              const breathingRadius =
                layerBaseSize * (1 + breathFactor * this.animState.amplitude);
              layerRadius = breathingRadius;

              // Calculate opacity
              layerOpacity =
                this.animState.opacity * (1 - i * 0.12) * splashVisibility;
            }

            // Generate organic shape
            if (layerOpacity <= 0.01) {
              path.setAttribute("opacity", "0");
              return;
            }

            const points: [number, number][] = [];
            const numPoints = 80;

            for (let j = 0; j < numPoints; j++) {
              const angle = (j / numPoints) * Math.PI * 2;
              const r = this.getDeformedRadius(angle, layerRadius, i);
              points.push([
                centerX + Math.cos(angle) * r,
                centerY + Math.sin(angle) * r,
              ]);
            }

            // Create smooth curve
            const d = this.solveCurve(points);
            path.setAttribute("d", d);
            path.setAttribute("opacity", layerOpacity.toString());
            path.setAttribute(
              "stroke-width",
              this.config.strokeWidth.toString()
            );
          });
        }

        solveCurve(points: [number, number][]): string {
          if (points.length < 2) return "";

          const len = points.length;
          let d = `M ${points[0][0]} ${points[0][1]} `;

          for (let i = 0; i < len; i++) {
            const p0 = points[i];
            const p1 = points[(i + 1) % len];
            const midX = (p0[0] + p1[0]) / 2;
            const midY = (p0[1] + p1[1]) / 2;
            d += `Q ${p0[0]} ${p0[1]} ${midX} ${midY} `;
          }

          d += "Z";
          return d;
        }

        animate() {
          this.updatePhysics(0.016); // Assume 60fps
          this.draw();
          this.animationFrameId = requestAnimationFrame(this.animate);
        }

        start() {
          if (this.animationFrameId === null) {
            this.animate();
          }
        }

        stop() {
          if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
          window.removeEventListener("resize", this.handleResize);
        }
      }

      const engine = new OrganicCirclesEngine(svgRef.current, {
        layers,
        baseColor,
        strokeWidth,
        position,
        speed,
        complexity,
        smoothness,
        radius,
        amplitude,
        opacity,
      });

      engine.currentMode = mode;
      engine.setMode(mode);
      engine.onModeComplete = onModeComplete;

      engineRef.current = engine;

      return () => {
        engine.stop();
        engineRef.current = null;
      };
    }, []); // Only run once on mount

    // Update parameters when props change
    useEffect(() => {
      if (engineRef.current) {
        // Check if layers will change (before updating)
        const currentLayers = engineRef.current.config.layerCount;
        const newLayers = Math.max(4, Math.min(7, layers));
        const layersChanged = currentLayers !== newLayers;

        // Update all config
        engineRef.current.updateConfig({
          layers,
          baseColor,
          strokeWidth,
          position,
          speed,
          complexity,
          smoothness,
          radius,
          amplitude,
          opacity,
        });

        // Recreate paths if layer count changed
        if (layersChanged) {
          engineRef.current.createLayers();
        }
      }
    }, [
      speed,
      complexity,
      smoothness,
      layers,
      opacity,
      strokeWidth,
      position,
      radius,
      amplitude,
      baseColor,
    ]);

    // Update mode when it changes
    useEffect(() => {
      if (engineRef.current && engineRef.current.currentMode !== mode) {
        engineRef.current.setMode(mode);
      }
    }, [mode]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      setMode: (newMode: MotionMode) => {
        if (engineRef.current) {
          engineRef.current.setMode(newMode);
        }
      },
      updateLayers: (count: number) => {
        if (engineRef.current) {
          engineRef.current.config.layerCount = count;
          engineRef.current.createLayers();
        }
      },
      updateParams: (params: Partial<OrganicCirclesProps>) => {
        if (engineRef.current) {
          engineRef.current.updateConfig(params);
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
      />
    );
  }
);

OrganicCircles.displayName = "OrganicCircles";

export default OrganicCircles;
