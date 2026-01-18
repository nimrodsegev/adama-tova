"use client";

import React, { useEffect, useState } from "react";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";

// ⏱️ CONTROL SETTINGS
const TEXT_APPEAR_DELAY = 3200;
const EXTRA_HOLD_TIME = 1000;

export default function GlobalSplash() {
  const [shouldShow, setShouldShow] = useState(true);
  const [showText, setShowText] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 1. Check for mobile to optimize animation later if needed
    setIsMobile(window.innerWidth < 768);

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
    setTimeout(() => {
      sessionStorage.setItem("has_seen_splash", "true");
      setIsFadingOut(true);
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

        // 📱 FIX 1: Use dvh (Dynamic Viewport Height)
        // This ensures it fits perfectly between mobile address bars/notches
        height: "100dvh",
        maxHeight: "-webkit-fill-available", // Safari fallback

        background: "var(--color-background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,

        // 🚀 FIX 2: Performance Optimizations
        opacity: isFadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
        willChange: "opacity", // Tells mobile GPU to get ready

        // Prevent scrolling/pull-to-refresh on the splash screen
        overscrollBehavior: "none",
        touchAction: "none",
        pointerEvents: isFadingOut ? "none" : "all",
      }}
      dir="rtl"
    >
      <h1
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          // 🚀 FIX 3: Use translate3d to force GPU acceleration
          transform: showText
            ? "translate3d(-50%, -50%, 0)"
            : "translate3d(-50%, -40%, 0)",

          color: "var(--color-text-primary)",
          fontFamily: "var(--font-primary)",

          // Responsive font size: slightly smaller on mobile to feel "cleaner"
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(iifont-weight-semibold)",

          opacity: showText ? 1 : 0,
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          willChange: "opacity, transform", // Hint to browser

          zIndex: 10000,
          margin: 0,
          whiteSpace: "nowrap",

          // Ensure text doesn't get cut off by notches in landscape
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        המרחב
      </h1>

      {/* If OrganicCircles is very heavy, you might consider 
         passing a simpler configuration for mobile if isMobile is true.
      */}
      <OrganicCircles
        mode="splash"
        radius={0.15}
        baseColor="var(--color-text-primary)"
        position={{ x: 0.5, y: 0.5 }}
        onModeComplete={handleSplashComplete}
      />
    </div>
  );
}
