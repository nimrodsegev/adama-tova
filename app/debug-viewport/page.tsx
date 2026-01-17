"use client";
import { useState, useEffect } from "react";

export default function DebugViewportPage() {
  const [info, setInfo] = useState<{
    screenWidth: number;
    screenHeight: number;
    innerWidth: number;
    innerHeight: number;
    devicePixelRatio: number;
    isPWA: boolean;
    missingHeight: number;
    userAgent: string;
  } | null>(null);

  useEffect(() => {
    const updateInfo = () => {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches;
      setInfo({
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        isPWA,
        missingHeight: window.screen.height - window.innerHeight,
        userAgent: navigator.userAgent,
      });
    };

    updateInfo();
    window.addEventListener("resize", updateInfo);
    return () => window.removeEventListener("resize", updateInfo);
  }, []);

  if (!info) return <div style={styles.container}>Loading...</div>;

  // Try to detect iPhone model from screen dimensions
  const getPhoneModel = () => {
    const { screenWidth, screenHeight } = info;
    const w = Math.min(screenWidth, screenHeight);
    const h = Math.max(screenWidth, screenHeight);

    if (w === 375 && h === 667) return "iPhone 6/7/8/SE2/SE3";
    if (w === 375 && h === 812) return "iPhone X/XS/11 Pro/12 mini/13 mini";
    if (w === 390 && h === 844) return "iPhone 12/13/14";
    if (w === 393 && h === 852) return "iPhone 14 Pro/15/15 Pro";
    if (w === 414 && h === 736) return "iPhone 6+/7+/8+";
    if (w === 414 && h === 896) return "iPhone XR/XS Max/11/11 Pro Max";
    if (w === 428 && h === 926) return "iPhone 12 Pro Max/13 Pro Max/14 Plus";
    if (w === 430 && h === 932) return "iPhone 14 Pro Max/15 Plus/15 Pro Max";
    if (w === 402 && h === 874) return "iPhone 16/16 Pro";
    if (w === 440 && h === 956) return "iPhone 16 Plus/16 Pro Max";
    return "Unknown";
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Viewport Debug</h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Device</h2>
        <p style={styles.value}>{getPhoneModel()}</p>
        <p style={styles.label}>Mode: {info.isPWA ? "PWA (Standalone)" : "Browser"}</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Screen Size</h2>
        <p style={styles.bigValue}>{info.screenWidth} x {info.screenHeight}</p>
        <p style={styles.label}>Physical screen dimensions</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Viewport Size (CSS)</h2>
        <p style={styles.bigValue}>{info.innerWidth} x {info.innerHeight}</p>
        <p style={styles.label}>What CSS sees (window.innerWidth/Height)</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Missing Height</h2>
        <p style={styles.bigValue}>{info.missingHeight}px</p>
        <p style={styles.label}>Lost to status bar, notch, home indicator</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Device Pixel Ratio</h2>
        <p style={styles.value}>{info.devicePixelRatio}x</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Suggested Media Query</h2>
        <pre style={styles.code}>
{`/* This phone */
@media (min-height: ${info.innerHeight - 10}px)
   and (max-height: ${info.innerHeight + 10}px) {
  /* styles */
}`}
        </pre>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Copy-Paste Summary</h2>
        <pre style={styles.code}>
{`Phone: ${getPhoneModel()}
Screen: ${info.screenWidth}x${info.screenHeight}
PWA Viewport: ${info.innerWidth}x${info.innerHeight}
Missing: ${info.missingHeight}px
Mode: ${info.isPWA ? "PWA" : "Browser"}`}
        </pre>
      </div>

      <div style={{ ...styles.card, background: "#333" }}>
        <h2 style={styles.cardTitle}>User Agent</h2>
        <p style={{ ...styles.label, wordBreak: "break-all", fontSize: "10px" }}>
          {info.userAgent}
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#1a1a1a",
    color: "#fff",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
  },
  card: {
    background: "#2a2a2a",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "8px",
    fontWeight: "normal",
  },
  bigValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#4ade80",
  },
  value: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    marginTop: "4px",
  },
  code: {
    background: "#1a1a1a",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "12px",
    overflow: "auto",
    color: "#4ade80",
  },
};
