"use client";
import { useState, useEffect } from "react";

export default function DebugViewportPage() {
  const [info, setInfo] = useState<{
    screenWidth: number;
    screenHeight: number;
    innerWidth: number;
    innerHeight: number;
    isPWA: boolean;
    missingHeight: number;
  } | null>(null);

  useEffect(() => {
    const updateInfo = () => {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches;
      setInfo({
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        isPWA,
        missingHeight: window.screen.height - window.innerHeight,
      });
    };
    updateInfo();
    window.addEventListener("resize", updateInfo);
    return () => window.removeEventListener("resize", updateInfo);
  }, []);

  if (!info) return <div style={s.container}>...</div>;

  const getPhoneModel = () => {
    const w = Math.min(info.screenWidth, info.screenHeight);
    const h = Math.max(info.screenWidth, info.screenHeight);
    if (w === 375 && h === 667) return "iPhone SE2/SE3";
    if (w === 375 && h === 812) return "iPhone X/12mini";
    if (w === 390 && h === 844) return "iPhone 12/13/14";
    if (w === 393 && h === 852) return "iPhone 14Pro/15";
    if (w === 428 && h === 926) return "iPhone 13ProMax";
    if (w === 430 && h === 932) return "iPhone 14ProMax/15ProMax";
    if (w === 402 && h === 874) return "iPhone 16/16Pro";
    if (w === 440 && h === 956) return "iPhone 16ProMax";
    return `Unknown (${w}x${h})`;
  };

  return (
    <div style={s.container}>
      <div style={s.title}>Viewport Debug</div>

      <div style={s.row}>
        <span style={s.label}>Phone:</span>
        <span style={s.val}>{getPhoneModel()}</span>
      </div>

      <div style={s.row}>
        <span style={s.label}>Mode:</span>
        <span style={{...s.val, color: info.isPWA ? "#4ade80" : "#f87171"}}>
          {info.isPWA ? "PWA" : "Browser"}
        </span>
      </div>

      <div style={s.divider} />

      <div style={s.row}>
        <span style={s.label}>Screen:</span>
        <span style={s.big}>{info.screenWidth} x {info.screenHeight}</span>
      </div>

      <div style={s.row}>
        <span style={s.label}>Viewport:</span>
        <span style={{...s.big, color: "#4ade80"}}>{info.innerWidth} x {info.innerHeight}</span>
      </div>

      <div style={s.row}>
        <span style={s.label}>Missing:</span>
        <span style={{...s.big, color: "#fbbf24"}}>{info.missingHeight}px</span>
      </div>

      <div style={s.divider} />

      <div style={s.summary}>
{`${getPhoneModel()}
Screen: ${info.screenWidth}x${info.screenHeight}
PWA: ${info.innerWidth}x${info.innerHeight}
Missing: ${info.missingHeight}px`}
      </div>
    </div>
  );
}

const s: { [k: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    background: "#1a1a1a",
    color: "#fff",
    padding: "16px",
    fontFamily: "system-ui, sans-serif",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "12px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  label: {
    fontSize: "14px",
    color: "#888",
  },
  val: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  big: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  divider: {
    height: "1px",
    background: "#333",
    margin: "12px 0",
  },
  summary: {
    background: "#2a2a2a",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#4ade80",
    whiteSpace: "pre",
  },
};
