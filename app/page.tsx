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
