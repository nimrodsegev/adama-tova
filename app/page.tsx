"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // 1. State to control text visibility
  const [showText, setShowText] = useState(false);

  const handleSplashComplete = () => {
    setAnimationFinished(true);
  };

  // 2. Effect to trigger the text fade-in
  useEffect(() => {
    // ⭐ CONTROL DELAY HERE (in milliseconds)
    const timer = setTimeout(() => {
      setShowText(true);
    }, 2600); // 1000ms = 1 second delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationFinished && !loading && !isExiting) {
      setIsExiting(true);
      const destination = !user ? "/login" : "/UserScreens/HomePage";
      setTimeout(() => {
        router.replace(destination);
      }, 90);
    }
  }, [animationFinished, loading, user, router, isExiting]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top, 0)",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        background:
          "linear-gradient(180deg, #E74E1C 0%, #DE6930 53%, #E79267 87%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <h1
        style={{
          position: "absolute",
          zIndex: 10,
          color: "#FFFFFF",
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          fontFamily: "var(--font-primary, sans-serif)",
          margin: 0,
          pointerEvents: "none",

          // 3. Animation Styles
          opacity: showText ? 1 : 0, // Starts invisible, becomes visible
          transition: "opacity 1.5s ease-out", // Smooth fade-in (adjust 1.5s to make it faster/slower)
          transform: showText ? "translateY(0)" : "translateY(10px)", // Optional: slight slide up
        }}
      >
        המרחב
      </h1>

      <OrganicCircles
        mode="splash"
        radius={0.15}
        baseColor="#FFFFFF"
        position={{ x: 0.5, y: 0.5 }}
        onModeComplete={handleSplashComplete}
      />
    </div>
  );
}
