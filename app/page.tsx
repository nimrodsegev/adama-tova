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

  const handleSplashComplete = () => {
    setAnimationFinished(true);
  };

  useEffect(() => {
    if (animationFinished && !loading && !isExiting) {
      setIsExiting(true);

      const destination = !user ? "/login" : "/UserScreens/HomePage";

      // Small delay before navigation
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
      }}
    >
      {/* 
        Splash mode has its own complete configuration in modeConfigs.ts
        We don't need to pass any props - it uses SPLASH_CONFIG internally
      */}
      <OrganicCircles
        mode="splash"
        radius={0.15} // Will be overridden by SPLASH_CONFIG
        baseColor="#FFFFFF"
        position={{ x: 0.5, y: 0.5 }}
        onModeComplete={handleSplashComplete}
      />
    </div>
  );
}
