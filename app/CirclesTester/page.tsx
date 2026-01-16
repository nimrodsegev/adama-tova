"use client";

import { useState, useRef, useEffect } from "react";
import OrganicCircles, {
  MotionMode,
} from "@/lib/components/OrganicCircles/OrganicCircles";
import {
  calculateShapeParams,
  UserProfile,
} from "@/app/utils/motionParamsCalculator";
import styles from "./CirclesTester.module.css";

const MODES: MotionMode[] = [
  "breathing",
  "spouting",
  "rolling",
  "splash",
  "static",
];

const CIRCLE_OPTIONS = [
  { label: "ללא", value: "" },
  { label: "שורדי ושורדות המסיבות", value: "שורדי ושורדות המסיבות" },
  { label: "כוחות הצלה וחילוץ", value: "כוחות הצלה וחילוץ" },
  { label: "הורים שכולים", value: "הורים שכולים" },
  { label: "אחים.ות שכולים", value: "אחים.ות שכולים" },
  { label: "תושבי העוטף ומפונים", value: "תושבי העוטף ומפונים" },
  {
    label: "משפחות פצועים",
    value: "משפחות וקרובים של פצועים טראומה בגופם ובנפשם",
  },
  { label: "מעגל שכול", value: "מעגל שני ושלישי של משפחות השכול" },
  { label: "נפגעי טראומה", value: "נפגעי טראומה 7.10 ומלחמת חרבות ברזל" },
];

const INTEREST_OPTIONS = [
  { label: "מיינדפולנס", value: "mindfulness" },
  { label: "גוף ותנועה", value: "body_motion" },
  { label: "מוזיקה וסאונד", value: "music_sound" },
  { label: "יצירה וחומר", value: "creation_material" },
];

export default function CirclesTester() {
  const [mode, setMode] = useState<MotionMode>("breathing");
  const [remountKey, setRemountKey] = useState(0);

  // --- DRAGGABLE WINDOW STATE ---
  const [winPos, setWinPos] = useState({ x: 50, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- PROFILE STATE ---
  const [selectedCircle, setSelectedCircle] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // --- VISUAL PARAMETERS ---
  const [radius, setRadius] = useState(0.15);
  const [layers, setLayers] = useState(4);
  const [smoothness, setSmoothness] = useState(0.8);
  const [complexity, setComplexity] = useState(0.3);
  const [elongation, setElongation] = useState(1.0);
  const [opacity, setOpacity] = useState(0.8);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [amplitude, setAmplitude] = useState(0.1);
  const [posX, setPosX] = useState(0.5);
  const [posY, setPosY] = useState(0.25);
  const [baseColor, setBaseColor] = useState("#FFFFFF");

  // --- GLOBAL SCROLL UNLOCKER ---
  useEffect(() => {
    // Forcefully remove overflow hidden from body/html while on this page
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";

    return () => {
      // Cleanup (optional, depends if you want to restore lock)
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  // --- ROBUST WINDOW DRAG HANDLERS ---
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setWinPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking the handle or the box itself (not inputs)
    if ((e.target as HTMLElement).tagName === "INPUT") return;

    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - winPos.x,
      y: e.clientY - winPos.y,
    };
  };

  // --- LOGIC ---
  const applyProfileToParams = (circle: string, interests: string[]) => {
    const mockProfile: UserProfile = {
      quiz: { circle, interests },
    };
    const params = calculateShapeParams(mockProfile);
    setLayers(params.layers);
    setSmoothness(params.smoothness);
    setComplexity(params.complexity);
    setElongation(params.elongation);
    setOpacity(params.opacity);
    setStrokeWidth(params.strokeWidth);
  };

  const handleCircleChange = (newCircle: string) => {
    setSelectedCircle(newCircle);
    applyProfileToParams(newCircle, selectedInterests);
  };

  const handleInterestToggle = (interestValue: string) => {
    const newInterests = selectedInterests.includes(interestValue)
      ? selectedInterests.filter((i) => i !== interestValue)
      : [...selectedInterests, interestValue];
    setSelectedInterests(newInterests);
    applyProfileToParams(selectedCircle, newInterests);
  };

  const resetToDefaults = () => {
    setRadius(0.15);
    setLayers(4);
    setSmoothness(0.8);
    setComplexity(0.3);
    setElongation(1.0);
    setOpacity(0.8);
    setStrokeWidth(1);
    setAmplitude(0.1);
    setPosX(0.5);
    setPosY(0.25);
    setBaseColor("#FFFFFF");
    setSelectedCircle("");
    setSelectedInterests([]);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* --- PREVIEW AREA --- */}
        <div className={styles.preview}>
          {/* Draggable Info Window */}
          <div
            className={styles.infoWindow}
            style={{
              top: winPos.y,
              left: winPos.x,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className={styles.dragHandle}>::: DRAG ME :::</div>

            <div className={styles.infoSection}>
              <strong>Circle:</strong>
              <div className={styles.infoValue}>{selectedCircle || "None"}</div>
            </div>

            <div className={styles.infoSection}>
              <strong>Interests:</strong>
              <div className={styles.infoValue}>
                {selectedInterests.length > 0
                  ? selectedInterests
                      .map(
                        (i) =>
                          INTEREST_OPTIONS.find((opt) => opt.value === i)
                            ?.label || i
                      )
                      .join(", ")
                  : "None"}
              </div>
            </div>

            <div className={styles.infoDivider}></div>

            <div className={styles.valueGrid}>
              <div className={styles.valueItem}>
                <span>Layers:</span>
                <span>{layers}</span>
              </div>
              <div className={styles.valueItem}>
                <span>Smooth:</span>
                <span>{smoothness.toFixed(2)}</span>
              </div>
              <div className={styles.valueItem}>
                <span>Complex:</span>
                <span>{complexity.toFixed(2)}</span>
              </div>
              <div className={styles.valueItem}>
                <span>Elong:</span>
                <span>{elongation.toFixed(2)}</span>
              </div>
              <div className={styles.valueItem}>
                <span>Opacity:</span>
                <span>{opacity.toFixed(2)}</span>
              </div>
              <div className={styles.valueItem}>
                <span>Stroke:</span>
                <span>{strokeWidth.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Circles Component */}
          {/* Note: pointerEvents: none on the wrapper ensures it doesn't block dragging */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <OrganicCircles
              key={remountKey}
              mode={mode}
              radius={radius}
              layers={layers}
              smoothness={smoothness}
              complexity={complexity}
              elongation={elongation}
              opacity={opacity}
              strokeWidth={strokeWidth}
              position={{ x: posX, y: posY }}
              baseColor={baseColor}
            />
          </div>
        </div>

        {/* --- CONTROLS PANEL --- */}
        <div className={styles.controlsPanel} dir="ltr">
          <div className={styles.fixedHeader}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1 className={styles.title}>Tester</h1>
              <button
                className={styles.renderButton}
                style={{ width: "auto" }}
                onClick={() => setRemountKey((p) => p + 1)}
              >
                Restart
              </button>
            </div>

            <div className={styles.profileSection}>
              <h3 className={styles.sectionTitle}>Profile Simulator (Live)</h3>
              <select
                className={styles.selectInput}
                value={selectedCircle}
                onChange={(e) => handleCircleChange(e.target.value)}
                dir="rtl"
              >
                {CIRCLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className={styles.checkboxGrid}>
                {INTEREST_OPTIONS.map((opt) => (
                  <label key={opt.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedInterests.includes(opt.value)}
                      onChange={() => handleInterestToggle(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.modeButtons}>
              {MODES.map((m) => (
                <button
                  key={m}
                  className={`${styles.modeButton} ${
                    mode === m ? styles.modeButtonActive : ""
                  }`}
                  onClick={() => setMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.scrollableContent}>
            <div className={styles.parametersGrid}>
              <div className={styles.control}>
                <label className={styles.label}>
                  Complexity <span>{complexity.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={complexity}
                  onChange={(e) => setComplexity(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Smoothness <span>{smoothness.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={smoothness}
                  onChange={(e) => setSmoothness(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Amplitude <span>{amplitude.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={amplitude}
                  onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Radius <span>{radius.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={radius}
                  onChange={(e) => setRadius(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Layers <span>{layers}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={layers}
                  onChange={(e) => setLayers(parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Opacity <span>{opacity.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Elongation <span>{elongation.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={elongation}
                  onChange={(e) => setElongation(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Stroke <span>{strokeWidth.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Pos X <span>{posX.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={posX}
                  onChange={(e) => setPosX(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.control}>
                <label className={styles.label}>
                  Pos Y <span>{posY.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={posY}
                  onChange={(e) => setPosY(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={`${styles.control} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Color <span>{baseColor}</span>
                </label>
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className={styles.colorPicker}
                />
              </div>
            </div>

            <button className={styles.resetButton} onClick={resetToDefaults}>
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
