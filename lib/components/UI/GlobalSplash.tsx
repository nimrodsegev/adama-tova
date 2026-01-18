"use client";

import React, { useEffect, useState } from "react";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";

const TEXT_APPEAR_DELAY = 2600; // Time before text fades in (ms)
const EXTRA_HOLD_TIME = 1000; // ⭐️ NEW: How long to wait AFTER animation finishes before closing (ms)

export default function GlobalSplash() {
  const [shouldShow, setShouldShow] = useState(true);
  const [showText, setShowText] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("has_seen_splash");

    if (hasSeenSplash) {
      setShouldShow(false);
    } else {
      const timer = setTimeout(() => {
        setShowText(true);
      }, TEXT_APPEAR_DELAY);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSplashComplete = () => {
    // ⭐️ CHANGE: We now wait for EXTRA_HOLD_TIME before starting the fade out
    setTimeout(() => {
      sessionStorage.setItem("has_seen_splash", "true");
      setIsFadingOut(true);

      // Remove from DOM after the fade-out transition (0.5s) is done
      setTimeout(() => {
        setShouldShow(false);
      }, 500);
    }, EXTRA_HOLD_TIME);
  };

  if (!shouldShow) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",

        // ✅ Using CSS Variable for easy changes
        background: "var(--color-background)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        opacity: isFadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
        pointerEvents: isFadingOut ? "none" : "all",
      }}
      dir="rtl"
    >
      <h1
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: showText
            ? "translate(-50%, -50%)"
            : "translate(-50%, -40%)",

          // ✅ Using CSS Variables for text and font
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-primary)",

          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          opacity: showText ? 1 : 0,
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          zIndex: 10000,
          margin: 0,
          whiteSpace: "nowrap",
        }}
      >
        המרחב
      </h1>

      <OrganicCircles
        mode="splash"
        radius={0.15}
        // ✅ We pass the variable string.
        // Note: If OrganicCircles uses canvas context.fillStyle, you might need a hex code here.
        // But if it uses SVG/CSS, this variable works perfectly.
        baseColor="var(--color-text-primary)"
        position={{ x: 0.5, y: 0.5 }}
        onModeComplete={handleSplashComplete}
      />
    </div>
  );
}
