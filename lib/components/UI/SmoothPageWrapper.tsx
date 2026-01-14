"use client";

import React, { useMemo, useState, useEffect } from "react";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { useUser } from "@/app/contexts/UserContext";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

// Define the exact types allowed by your OrganicCircles component
type AllowedModes =
  | "static"
  | "spouting"
  | "breathing"
  | "splash"
  | "loading"
  | "rolling";

interface SmoothPageWrapperProps {
  children: React.ReactNode;
  isLoading: boolean;
  mode?: AllowedModes;
  minDuration?: number;
  radiusScale?: number;
  baseColor?: string;
}

export default function SmoothPageWrapper({
  children,
  isLoading,
  mode = "spouting",
  minDuration = 10,
  radiusScale = 1.0,
  baseColor = "#FFFFFF",
}: SmoothPageWrapperProps) {
  const { userProfile } = useUser();

  // 1. Initialize as TRUE so we don't block initially unless loading starts
  const [minTimeElapsed, setMinTimeElapsed] = useState(true);

  // Responsive Config
  const [circleConfig, setCircleConfig] = useState({
    radius: 0.35,
    x: 0.5,
    y: 0.5,
  });

  const shapeParams = useMemo(() => {
    return calculateShapeParams(userProfile);
  }, [userProfile]);

  // --- TIMER LOGIC (THE FIX) ---

  // Step A: When loading starts, immediately LOCK the screen (elapsed = false)
  useEffect(() => {
    if (isLoading) {
      setMinTimeElapsed(false);
    }
  }, [isLoading]);

  // Step B: Whenever the screen is locked, start the timer to UNLOCK it.
  // This is separate from isLoading, so it won't be cancelled if data loads fast.
  useEffect(() => {
    if (!minTimeElapsed) {
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [minTimeElapsed, minDuration]);

  // -----------------------------

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let newRadius = 0.35;
      let newY = 0.5;

      if (width < 380) {
        newRadius = 0.25;
        newY = 0.45;
      } else if (width > 600) {
        newRadius = 0.35;
      } else {
        newRadius = 0.3;
      }

      if (height < 700) newRadius = 0.25;

      setCircleConfig({
        radius: newRadius,
        x: 0.5,
        y: newY,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loader if Data is loading OR Timer is still running
  const showLoader = isLoading || !minTimeElapsed;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background:
            "linear-gradient(180deg, #E74E1C 0%, #DE6930 53%, #E79267 87%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          opacity: showLoader ? 1 : 0,
          pointerEvents: showLoader ? "all" : "none",
          transition: "opacity 0.6s ease-in-out",
        }}
        dir="rtl"
      >
        <OrganicCircles
          mode={mode}
          radius={circleConfig.radius * radiusScale}
          position={{ x: circleConfig.x, y: circleConfig.y }}
          baseColor={baseColor}
          {...shapeParams}
        />
      </div>

      <div
        style={{
          opacity: showLoader ? 0 : 1,
          transform: showLoader ? "translateY(20px)" : "translateY(0)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          transitionDelay: "0.2s",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </>
  );
}
