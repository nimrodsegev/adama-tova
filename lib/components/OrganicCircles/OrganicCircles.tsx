"use client";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { getModeConfig, SPLASH_CONFIG, type MotionMode } from "./modeConfigs";

class NoiseGenerator {
  private perm: Uint8Array;
  constructor() {
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++)
      this.perm[i] = Math.floor(Math.random() * 256);
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
    const X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x),
      v = fade(y);
    const A = this.perm[X] + Y,
      B = this.perm[X + 1] + Y;
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

export type { MotionMode };

export interface OrganicCirclesRef {
  setMode: (mode: MotionMode) => void;
  updateLayers: (count: number) => void;
  updateParams: (params: Partial<OrganicCirclesProps>) => void;
}

export interface OrganicCirclesProps {
  mode?: MotionMode;
  radius: number;
  layers?: number;
  smoothness?: number;
  complexity?: number;
  elongation?: number;
  opacity?: number;
  strokeWidth?: number;
  position?: { x: number; y: number };
  baseColor?: string;
  onModeComplete?: (mode: MotionMode) => void;
}

const OrganicCircles = forwardRef<OrganicCirclesRef, OrganicCirclesProps>(
  (props, ref) => {
    const {
      mode = "breathing",
      radius,
      layers = 4,
      smoothness = 0.8,
      complexity = 0.1,
      elongation = 1.0,
      opacity = 0.8,
      strokeWidth = 1.5,
      position = { x: 0.5, y: 0.5 },
      baseColor = "#FFFFFF",
      onModeComplete,
    } = props;
    const svgRef = useRef<SVGSVGElement>(null);
    const engineRef = useRef<any>(null);

    useEffect(() => {
      if (!svgRef.current) return;
      const noise = new NoiseGenerator();
      const ns = "http://www.w3.org/2000/svg";

      class OrganicCirclesEngine {
        svg: SVGSVGElement;
        width: number;
        height: number;
        paths: SVGPathElement[] = [];
        animState = {
          radius: 0,
          amplitude: 0,
          noiseSpeed: 0,
          complexity: 0,
          smoothness: 0,
          opacity: 0,
          elongation: 1.0,
          centerXOffset: 0,
          centerYOffset: 0,
          time: 0,
          breathPhase: 0,
          breathCycleSeconds: 5.0,
          splashProgress: 0,
          emitPhase: 0,
          rollingStartTime: 0,
          splashCallbackTriggered: false,
        };
        targets: any = {
          radius: 0,
          amplitude: 0,
          noiseSpeed: 0,
          complexity: 0.1,
          smoothness: 0.8,
          opacity: 0.8,
          elongation: 1.0,
        };
        currentMode: MotionMode = "breathing";
        config = {
          layerCount: 4,
          baseColor: "#FFFFFF",
          strokeWidth: 1.5,
          position: { x: 0.5, y: 0.5 },
        };
        animationFrameId: number | null = null;
        onModeComplete?: (mode: MotionMode) => void;

        constructor(svg: SVGSVGElement, initial: any) {
          this.svg = svg;
          this.width = window.innerWidth;
          this.height = window.innerHeight;
          this.currentMode = initial.mode || "breathing";
          this.updateTargetsForMode(this.currentMode, initial.radius);
          this.updateConfig(initial);
          this.createLayers();
          this.animate = this.animate.bind(this);
          this.animate();
          window.addEventListener("resize", () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
          });
        }

        updateConfig(c: any) {
          if (this.currentMode === "splash") {
            if (c.baseColor !== undefined) this.config.baseColor = c.baseColor;
            if (c.position !== undefined) this.config.position = c.position;
            return;
          }

          if (c.layers !== undefined)
            this.config.layerCount = Math.max(1, Math.min(10, c.layers));
          if (c.baseColor !== undefined) this.config.baseColor = c.baseColor;
          if (c.strokeWidth !== undefined)
            this.config.strokeWidth = c.strokeWidth;
          if (c.position !== undefined) this.config.position = c.position;
          if (c.complexity !== undefined)
            this.targets.complexity = c.complexity;
          if (c.smoothness !== undefined)
            this.targets.smoothness = c.smoothness;
          if (c.opacity !== undefined) this.targets.opacity = c.opacity;
          if (c.elongation !== undefined)
            this.targets.elongation = c.elongation;
          if (c.radius !== undefined) this.targets.radius = c.radius;
        }

        updateTargetsForMode(m: MotionMode, r: number) {
          this.currentMode = m;
          if (m === "splash") {
            this.targets = {
              radius: SPLASH_CONFIG.radius,
              amplitude: SPLASH_CONFIG.amplitude,
              noiseSpeed: SPLASH_CONFIG.speed,
              elongation: SPLASH_CONFIG.elongation,
              complexity: SPLASH_CONFIG.complexity,
              smoothness: SPLASH_CONFIG.smoothness,
              opacity: SPLASH_CONFIG.opacity,
            };
            this.config.layerCount = SPLASH_CONFIG.layers;
            this.animState.breathCycleSeconds =
              5.0 / Math.max(0.1, SPLASH_CONFIG.speed);
            this.animState.splashCallbackTriggered = false;
          } else if (m === "static") {
            // Static mode: no amplitude, no speed, but uses calculator values
            this.targets.radius = r;
            this.targets.amplitude = 0;
            this.targets.noiseSpeed = 0;
            this.targets.elongation = this.targets.elongation || 1.0;
          } else {
            const conf = getModeConfig(m);
            this.targets.radius = r;
            this.targets.amplitude = conf.amplitude;
            this.targets.noiseSpeed = conf.speed;
            this.targets.elongation = conf.elongation;
            this.animState.breathCycleSeconds = 5.0 / Math.max(0.1, conf.speed);
          }
        }

        setMode(m: MotionMode, r: number) {
          this.updateTargetsForMode(m, r);
          if (m === "splash") {
            this.animState.radius = 0;
            this.animState.splashProgress = 0;
            this.animState.splashCallbackTriggered = false;
            this.createLayers();
          } else if (m === "spouting") {
            this.animState.emitPhase = 0;
          } else if (m === "rolling") {
            this.animState.rollingStartTime = Date.now();
            this.animState.centerXOffset = -this.width * 0.3;
          } else {
            this.animState.centerXOffset = 0;
            this.animState.centerYOffset = 0;
          }
        }

        createLayers() {
          this.svg.innerHTML = "";
          this.paths = [];
          for (let i = 0; i < this.config.layerCount; i++) {
            const p = document.createElementNS(ns, "path");
            p.setAttribute("fill", "none");
            p.setAttribute("stroke", this.config.baseColor);
            p.setAttribute("stroke-width", this.config.strokeWidth.toString());
            this.svg.appendChild(p);
            this.paths.push(p);
          }
        }

        getDeformedRadius(
          angle: number,
          baseR: number,
          layerIndex: number
        ): number {
          const noiseScale = 2.5 - this.animState.smoothness * 2.0;
          // In static mode, this.animState.time will be constant
          const nx =
            (Math.cos(angle) * noiseScale) /
              Math.max(0.1, this.animState.elongation) +
            this.animState.time * 0.5;
          const ny = Math.sin(angle) * noiseScale + layerIndex * 10;
          let n =
            (noise.noise2D(nx, ny) + 0.5 * noise.noise2D(nx * 2, ny * 2)) / 1.5;

          return baseR * (1 + n * this.animState.complexity * 0.3);
        }

        updatePhysics(dt: number) {
          const ease = 0.05;
          const keys = [
            "radius",
            "amplitude",
            "noiseSpeed",
            "complexity",
            "smoothness",
            "opacity",
            "elongation",
          ];
          keys.forEach((k) => {
            if (this.targets[k] !== undefined)
              (this.animState as any)[k] +=
                (this.targets[k] - (this.animState as any)[k]) * ease;
          });

          // Only increment time and phase if not in static mode
          if (this.currentMode !== "static") {
            this.animState.time += dt * this.animState.noiseSpeed;
            this.animState.breathPhase +=
              dt *
              ((Math.PI * 2) /
                Math.max(0.1, this.animState.breathCycleSeconds));
            this.animState.emitPhase += dt * 0.1;
          }

          if (
            this.currentMode === "splash" &&
            this.animState.splashProgress < 1
          ) {
            this.animState.splashProgress += dt * 0.15;
            if (this.animState.splashProgress >= 1) {
              this.animState.splashProgress = 1;
              if (
                this.onModeComplete &&
                !this.animState.splashCallbackTriggered
              ) {
                this.animState.splashCallbackTriggered = true;
                this.onModeComplete("splash");
              }
            }
          }

          let tx = 0,
            ty = 0;
          if (this.currentMode === "rolling") {
            const elapsed = Date.now() - this.animState.rollingStartTime;
            const totalWidth = this.width * 1.3;
            tx = -this.width * 0.3 + ((elapsed * 0.08) % totalWidth);
            ty = Math.sin(elapsed * 0.002) * 20;
          }

          const currentEase = this.currentMode === "rolling" ? 0.8 : ease;
          this.animState.centerXOffset +=
            (tx - this.animState.centerXOffset) * currentEase;
          this.animState.centerYOffset +=
            (ty - this.animState.centerYOffset) * currentEase;
        }

        draw() {
          const cx =
            this.width * this.config.position.x + this.animState.centerXOffset;
          const cy =
            this.height * this.config.position.y + this.animState.centerYOffset;
          const dim = Math.min(this.width, this.height);

          // In static mode, breath is effectively 0
          const breath =
            this.currentMode === "static"
              ? 0
              : Math.sin(this.animState.breathPhase);

          this.paths.forEach((path, i) => {
            let r, op;

            if (this.currentMode === "spouting") {
              const layerOffset = i / this.config.layerCount;
              const progress = (this.animState.emitPhase + layerOffset) % 1;
              r = this.animState.radius * dim * progress;
              const fadeIn = Math.min(progress * 8, 1);
              const fadeOut = 1 - Math.pow(progress, 3);
              op = this.animState.opacity * fadeOut * fadeIn;
            } else if (this.currentMode === "splash") {
              const start = i / this.config.layerCount,
                end = (i + 1) / this.config.layerCount;
              const sVis =
                this.animState.splashProgress < start
                  ? 0
                  : this.animState.splashProgress >= end
                  ? 1
                  : (this.animState.splashProgress - start) / (end - start);
              r =
                this.animState.radius *
                dim *
                (1 + i * 0.25) *
                (1 + breath * this.animState.amplitude);
              op = this.animState.opacity * (1 - i * 0.12) * sVis;
            } else {
              // Standard drawing (including static)
              r =
                this.animState.radius *
                dim *
                (1 + i * 0.25) *
                (1 + breath * this.animState.amplitude);
              op = this.animState.opacity * (1 - i * 0.12);
            }

            if (op <= 0.01 || r <= 0) {
              path.setAttribute("opacity", "0");
              return;
            }

            const pts: [number, number][] = [];
            const rot = this.currentMode === "rolling" ? Date.now() * 0.004 : 0;
            for (let j = 0; j < 80; j++) {
              const a = (j / 80) * Math.PI * 2;
              const rad = this.getDeformedRadius(a + rot, r, i);
              pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
            }
            path.setAttribute("d", this.solveCurve(pts));
            path.setAttribute("opacity", op.toString());
            path.setAttribute("stroke", this.config.baseColor);
            path.setAttribute("fill", "none");
            path.setAttribute(
              "stroke-width",
              this.config.strokeWidth.toString()
            );
          });
        }

        solveCurve(pts: [number, number][]): string {
          if (pts.length < 2) return "";
          let d = `M ${pts[0][0]} ${pts[0][1]} `;
          for (let i = 0; i < pts.length; i++) {
            const p0 = pts[i],
              p1 = pts[(i + 1) % pts.length];
            d += `Q ${p0[0]} ${p0[1]} ${(p0[0] + p1[0]) / 2} ${
              (p0[1] + p1[1]) / 2
            } `;
          }
          return d + "Z";
        }

        animate() {
          this.updatePhysics(0.016);
          this.draw();
          this.animationFrameId = requestAnimationFrame(this.animate);
        }
        stop() {
          if (this.animationFrameId)
            cancelAnimationFrame(this.animationFrameId);
          window.removeEventListener("resize", () => {});
        }
      }

      const engine = new OrganicCirclesEngine(svgRef.current, {
        mode,
        layers,
        baseColor,
        strokeWidth,
        position,
        complexity,
        smoothness,
        radius,
        opacity,
        elongation,
      });
      engine.onModeComplete = onModeComplete;
      engineRef.current = engine;
      return () => engine.stop();
    }, []);

    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.updateConfig({
          layers,
          baseColor,
          strokeWidth,
          position,
          complexity,
          smoothness,
          radius,
          opacity,
          elongation,
        });
        if (
          engineRef.current.config.layerCount !== layers &&
          engineRef.current.currentMode !== "splash"
        )
          engineRef.current.createLayers();
      }
    }, [
      complexity,
      smoothness,
      layers,
      opacity,
      strokeWidth,
      position,
      radius,
      baseColor,
      elongation,
    ]);

    useEffect(() => {
      if (engineRef.current && engineRef.current.currentMode !== mode)
        engineRef.current.setMode(mode, radius);
    }, [mode, radius]);

    useImperativeHandle(ref, () => ({
      setMode: (m) => engineRef.current?.setMode(m, radius),
      updateLayers: (c) => {
        if (engineRef.current) {
          engineRef.current.config.layerCount = c;
          engineRef.current.createLayers();
        }
      },
      updateParams: (p) => engineRef.current?.updateConfig(p),
    }));

    return (
      <svg
        ref={svgRef}
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

export default OrganicCircles;
