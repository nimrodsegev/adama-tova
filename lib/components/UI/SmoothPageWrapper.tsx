"use client";

import React, { useMemo, useState, useEffect } from "react";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { useUser } from "@/app/contexts/UserContext";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

interface SmoothPageWrapperProps {
  children: React.ReactNode;
  isLoading: boolean;
  mode?: "spouting" | "breathing" | "liquid" | "blob";
  minDuration?: number; // New optional prop to control time
}

export default function SmoothPageWrapper({
  children,
  isLoading,
  mode = "spouting",
  minDuration = 1000, // Default: Wait at least 1 second (1000ms)
}: SmoothPageWrapperProps) {
  const { userProfile } = useUser();

  // 1. State to track if the minimum time has passed
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 2. Responsive Circle Logic
  const [circleConfig, setCircleConfig] = useState({
    radius: 0.35,
    x: 0.5,
    y: 0.5,
  });

  const shapeParams = useMemo(() => {
    return calculateShapeParams(userProfile);
  }, [userProfile]);

  // 3. Start the timer on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // 4. Handle Resize (Same as before)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (width < 380) {
        setCircleConfig({ radius: 0.25, x: 0.5, y: 0.45 });
      } else if (width > 600) {
        setCircleConfig({ radius: 0.35, x: 0.5, y: 0.5 });
      } else {
        setCircleConfig({ radius: 0.3, x: 0.5, y: 0.5 });
      }

      if (height < 700) {
        setCircleConfig((prev) => ({ ...prev, radius: 0.25 }));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 5. Logic: Show loader if Data is loading OR Timer hasn't finished
  const showLoader = isLoading || !minTimeElapsed;

  return (
    <>
      {/* --- LAYER 1: THE LOADER --- */}
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

          // Use our new combined boolean
          opacity: showLoader ? 1 : 0,
          pointerEvents: showLoader ? "all" : "none",
          transition: "opacity 0.6s ease-in-out",
        }}
        dir="rtl"
      >
        <OrganicCircles
          mode={"spouting"}
          radius={circleConfig.radius}
          position={{ x: circleConfig.x, y: circleConfig.y }}
          {...shapeParams}
          baseColor="#FFFFFF"
        />
      </div>

      {/* --- LAYER 2: THE CONTENT --- */}
      <div
        style={{
          opacity: showLoader ? 0 : 1,
          transform: showLoader ? "translateY(20px)" : "translateY(0)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          // Wait for loader to start fading before revealing content
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
