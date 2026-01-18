"use client";

import React, { useEffect, useState } from "react";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";

export default function GlobalSplash() {
  const [shouldShow, setShouldShow] = useState(true);
  const [showText, setShowText] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the splash in this session
    const hasSeenSplash = sessionStorage.getItem("has_seen_splash");

    if (hasSeenSplash) {
      setShouldShow(false);
    } else {
      // If not seen, start animation sequence
      // 2.6s delay syncs with the OrganicCircles opening animation
      const timer = setTimeout(() => {
        setShowText(true);
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("has_seen_splash", "true");
    setIsFadingOut(true);

    setTimeout(() => {
      setShouldShow(false);
    }, 500);
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
