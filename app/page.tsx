"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import OrganicCircles, {
  OrganicCirclesRef,
} from "@/lib/components/OrganicCircles/OrganicCircles";
import { SPLASH_CONFIG } from "@/lib/components/OrganicCircles/modeConfigs";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleSplashComplete = () => {
    setAnimationFinished(true);
  };

  useEffect(() => {
    if (animationFinished && !loading && !isExiting) {
      // 1. Trigger the "Exiting" state instead of jumping immediately
      setIsExiting(true);

      // 2. Smallest possible delay to let the UI render "You're in!"
      // before the browser starts the route transition
      const destination = !user ? "/login" : "/UserScreens/HomePage";

      // Using a tiny timeout to ensure the DOM updates with the new text first
      setTimeout(() => {
        router.replace(destination);
      }, 100);
    }
  }, [animationFinished, loading, user, router, isExiting]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#F28130",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <OrganicCircles
        mode="splash"
        speed={SPLASH_CONFIG.speed}
        complexity={SPLASH_CONFIG.complexity}
        smoothness={SPLASH_CONFIG.smoothness}
        layers={SPLASH_CONFIG.layers}
        opacity={SPLASH_CONFIG.opacity}
        radius={SPLASH_CONFIG.radius}
        amplitude={SPLASH_CONFIG.amplitude}
        baseColor="#FFFFFF"
        position={{ x: 0.5, y: 0.5 }}
        onModeComplete={handleSplashComplete}
      />
    </div>
  );
}
