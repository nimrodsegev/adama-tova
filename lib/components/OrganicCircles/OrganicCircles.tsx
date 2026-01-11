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
            this.config.layerCount = Math.max(4, Math.min(7, c.layers));
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
          const conf = getModeConfig(m);
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
            this.animState.splashCallbackTriggered = false; // Reset trigger for new splash
          } else {
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
          } else if (m === "rolling") {
            this.animState.rollingStartTime = Date.now();
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

          this.animState.time += dt * this.animState.noiseSpeed;

          // FIXED SPLASH LOGIC: Increment and trigger callback once
          if (this.currentMode === "splash") {
            if (this.animState.splashProgress < 1) {
              this.animState.splashProgress += dt * 0.15; // Animation Speed
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
          }

          this.animState.emitPhase +=
            this.currentMode === "spouting" ? dt * 0.1 : 0;
          let tx = 0,
            ty = 0;
          if (this.currentMode === "rolling") {
            const elapsed = Date.now() - this.animState.rollingStartTime;
            tx = -this.width * 0.3 + ((elapsed * 0.08) % (this.width * 1.3));
            ty = Math.sin(elapsed * 0.002) * 20;
          }
          this.animState.centerXOffset +=
            (tx - this.animState.centerXOffset) * ease;
          this.animState.centerYOffset +=
            (ty - this.animState.centerYOffset) * ease;
          this.animState.breathPhase +=
            dt *
            ((Math.PI * 2) / Math.max(0.1, this.animState.breathCycleSeconds));
        }

        draw() {
          const cx =
            this.width * this.config.position.x + this.animState.centerXOffset;
          const cy =
            this.height * this.config.position.y + this.animState.centerYOffset;
          const dim = Math.min(this.width, this.height);
          const breath = Math.sin(this.animState.breathPhase);

          this.paths.forEach((path, i) => {
            let r, op;
            if (this.currentMode === "spouting") {
              const prog =
                (this.animState.emitPhase + i / this.config.layerCount) % 1;
              r = this.animState.radius * dim * prog;
              op =
                this.animState.opacity *
                (1 - Math.pow(prog, 3)) *
                Math.min(prog * 8, 1);
            } else {
              let sVis = 1;
              if (this.currentMode === "splash") {
                const start = i / this.config.layerCount,
                  end = (i + 1) / this.config.layerCount;
                sVis =
                  this.animState.splashProgress < start
                    ? 0
                    : this.animState.splashProgress >= end
                    ? 1
                    : (this.animState.splashProgress - start) / (end - start);
              }
              r =
                this.animState.radius *
                dim *
                (1 + i * 0.25) *
                (1 + breath * this.animState.amplitude);
              op = this.animState.opacity * (1 - i * 0.12) * sVis;
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
      engine.onModeComplete = onModeComplete; // Assign the callback
      engineRef.current = engine;
      return () => engine.stop();
    }, []);

    // Update dependencies - ensure onModeComplete is included
    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.onModeComplete = onModeComplete;
      }
    }, [onModeComplete]);

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
