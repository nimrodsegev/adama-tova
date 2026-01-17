"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import styles from "./Home.module.css"; // Import the CSS file

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showText, setShowText] = useState(false);

  const handleSplashComplete = () => {
    setAnimationFinished(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 2600);

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
    <div className={styles.pageContainer}>
      <h1
        className={styles.splashTitle}
        style={{
          // Control visibility and slight motion via inline styles
          // Note: We combine the translateY(-50%) from CSS with the animation offset
          opacity: showText ? 1 : 0,
          transform: showText
            ? "translateY(-50%)" // End state: Exact center defined in CSS
            : "translateY(-40%)", // Start state: Slightly lower/higher for effect
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
