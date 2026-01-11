"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import { useUser } from "@/app/contexts/UserContext";
import type { MotionMode } from "@/lib/components/OrganicCircles/modeConfigs";

interface PageTransitionContextType {
  isTransitioning: boolean;
  currentTransitionMode: MotionMode;
  setTransitionMode: (mode: MotionMode) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isTransitioning: false,
  currentTransitionMode: "spouting",
  setTransitionMode: () => {},
});

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

// Pages that should NOT show the transition animation
const SKIP_TRANSITION_PATHS = [
  "/", // Home/Splash page has its own animation
  "/login",
  "/signup",
];

export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMode, setTransitionMode] = useState<MotionMode>("spouting");
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const { userProfile } = useUser();
  const isInitialMount = useRef(true);

  // Calculate shape parameters for transition screen
  const shapeParams = calculateShapeParams(userProfile);

  // Check if current path should skip transition
  const shouldSkipTransition = SKIP_TRANSITION_PATHS.includes(pathname);

  useEffect(() => {
    // Skip transition on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPathname.current = pathname;
      return;
    }

    // Skip if this page doesn't need transitions
    if (shouldSkipTransition) {
      previousPathname.current = pathname;
      setIsTransitioning(false);
      return;
    }

    // Handle navigation changes
    if (pathname !== previousPathname.current) {
      const previousPath = previousPathname.current;
      previousPathname.current = pathname;

      // Skip transition if coming FROM a skip page
      if (previousPath && SKIP_TRANSITION_PATHS.includes(previousPath)) {
        setIsTransitioning(false);
        return;
      }

      // Show transition
      setIsTransitioning(true);

      // Hide transition after 750ms
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [pathname, shouldSkipTransition]);

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        currentTransitionMode: transitionMode,
        setTransitionMode,
      }}
    >
      {/* Full-screen loading overlay - only show if not on skip page */}
      {isTransitioning && !shouldSkipTransition && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#F28130",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            color: "#EFEFEF",
            fontFamily: "Ezer Shemesh TRIAL ONLY, sans-serif",
            fontSize: "1.25rem",
          }}
          dir="rtl"
        >
          <OrganicCircles
            mode={transitionMode}
            radius={0.45}
            {...shapeParams}
            baseColor="#FFFFFF"
            position={{ x: 0.5, y: 0.5 }}
          />
        </div>
      )}

      {/* Page content - always rendered */}
      {children}
    </PageTransitionContext.Provider>
  );
}
