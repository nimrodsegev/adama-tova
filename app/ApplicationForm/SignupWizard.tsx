"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/authService";
import { userService } from "@/app/services/userService";
import styles from "./SignupWizard.module.css";
import { useIvrita } from "@/app/contexts/IvritaContext";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import CutInput from "@/lib/components/UI/CutInput";
import Button from "@/lib/components/UI/Button";

interface SignupWizardProps {
  signupType: "email" | "google";
  email: string;
  password: string;
  googleUserId?: string;
  onBack: () => void;
}

const CIRCLE_OPTIONS = [
  "שורדי ושורדות המסיבות",
  "נפגעי טראומה 7.10 ומלחמת חרבות ברזל",
  "הורים שכולים",
  "אחים.ות שכולים",
  "משפחות וקרובים של פצועים טראומה בגופם ובנפשם",
  "כוחות הצלה וחילוץ",
  "תושבי העוטף ומפונים",
  "מעגל שני ושלישי של משפחות השכול",
  "אחר",
];

const INTEREST_OPTIONS = [
  'מיינדפולנס',
  'גוף ותנועה',
  'מוזיקה',
  'יצירה וחומר',
];

const BRANCH_OPTIONS = [
  { value: "nahalal", label: "נהלל" },
  { value: "satria", label: "סתריה" },
];

const GENDER_OPTIONS: {
  value: "male" | "female" | "prefer_not_to_say";
  label: string;
}[] = [
  { value: "male", label: "זכר" },
  { value: "female", label: "נקבה" },
  { value: "prefer_not_to_say", label: "מעדיפ/ה לא לציין" },
];

const TOTAL_STEPS = 5;

export default function SignupWizard({
  signupType,
  email,
  password,
  googleUserId,
  onBack,
}: SignupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setGender: setIvritaGender, t } = useIvrita();

  // Form data
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<
    "male" | "female" | "prefer_not_to_say" | null
  >(null);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [circle, setCircle] = useState("");
  const [circleDropdownOpen, setCircleDropdownOpen] = useState(false);
  const [proximity, setProximity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");

  // Field errors
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Scroll snap refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Touch tracking for back gesture on first page
  const touchStartX = useRef<number | null>(null);
  const touchStartScrollLeft = useRef<number | null>(null);

  // OrganicCircles parameters - start with defaults
  const defaultParams = useMemo(() => calculateShapeParams(null), []);

  // SEPARATE STATE FOR LAYER COUNT - starts at 1
  const [layerCount, setLayerCount] = useState(1);

  // CALCULATED PARAMS based on user selections (Step 2+)
  const [calculatedParams, setCalculatedParams] = useState(defaultParams);

  // Responsive radius and position for very small screens (iPhone SE, etc.)
  const [circleRadius, setCircleRadius] = useState(0.11);
  const [circlePosition, setCirclePosition] = useState({ x: 0.3, y: 0.15 });

  useEffect(() => {
    const updateCircleParams = () => {
      const height = window.innerHeight;
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;

      // PWA mode has larger viewport - adjust position to be more centered
      if (isPWA) {
        setCircleRadius(0.09);
        setCirclePosition({ x: 0.32, y: 0.12 }); // More centered for PWA
      } else if (height <= 670) {
        // Very small screens (iPhone SE: 667px height, older SE: 568px)
        setCircleRadius(0.08);
        setCirclePosition({ x: 0.22, y: 0.12 });
      } else {
        // Larger screens
        setCircleRadius(0.10);
        setCirclePosition({ x: 0.32, y: 0.12 }); // More to the right
      }
    };

    updateCircleParams();
    window.addEventListener("resize", updateCircleParams);
    return () => window.removeEventListener("resize", updateCircleParams);
  }, []);

  const isHebrewName = (name: string) => /^[\u0590-\u05FF\s]+$/.test(name);
  const isValidIsraeliMobile = (p: string) =>
    /^05\d{8}$/.test(p.replace(/[-\s]/g, ""));

  // Computed validation - determines if scrolling is allowed
  const isStep0Valid = useMemo(() => {
    const trimmedName = fullName.trim();
    const cleanPhone = phone.replace(/[-\s]/g, "");
    return (
      trimmedName !== "" &&
      isHebrewName(trimmedName) &&
      cleanPhone !== "" &&
      isValidIsraeliMobile(cleanPhone)
    );
  }, [fullName, phone]);

  // STEP 0: UPDATE LAYER COUNT based on filled fields (lines 109-125)
  useEffect(() => {
    let layers = 1; // Start with 1 layer

    // Add 1 layer for each valid filled field
    if (fullName.trim() && isHebrewName(fullName.trim())) {
      layers++;
    }
    if (phone.trim() && isValidIsraeliMobile(phone.replace(/[-\s]/g, ""))) {
      layers++;
    }
    if (gender) {
      layers++;
    }

    // Update the layer count state (max 4 layers)
    setLayerCount(Math.min(layers, 4));

    console.log("Step 0 - Layer count updated to:", Math.min(layers, 4));
  }, [fullName, phone, gender]);

  // STEP 2+ (Interests & Circle): CALCULATE ALL PARAMS using calculator (lines 127-148)
  useEffect(() => {
    // Build user profile for calculator
    const userProfile = {
      gender: gender || undefined,
      quiz: {
        interests: interests.length > 0 ? interests : undefined,
        circle: circle || undefined,
        branches: branches.length > 0 ? branches : undefined,
        free_text: freeText || undefined,
      },
    };

    // Calculate params based on selections
    const params = calculateShapeParams(userProfile as any);

    setCalculatedParams(params);

    console.log("Step 2+ - Calculated params:", params);
  }, [interests, circle, gender, branches, freeText]);

  const validateStep0 = (): boolean => {
    setNameError("");
    setPhoneError("");

    if (!fullName.trim()) {
      setNameError("שדה חובה");
      return false;
    }
    if (!isHebrewName(fullName.trim())) {
      setNameError("עברית בלבד");
      return false;
    }
    if (!phone.trim()) {
      setPhoneError("שדה חובה");
      return false;
    }
    const cleanPhone = phone.replace(/[-\s]/g, "");
    if (!isValidIsraeliMobile(cleanPhone)) {
      setPhoneError("מספר טלפון לא תקין");
      return false;
    }
    return true;
  };

  // Handle scroll to detect current step (works with RTL)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const slideWidth = container.offsetWidth;
    // Use Math.abs for RTL compatibility (scrollLeft can be negative in RTL)
    const scrollPosition = Math.abs(container.scrollLeft);
    const newStep = Math.round(scrollPosition / slideWidth);

    if (newStep >= 0 && newStep < TOTAL_STEPS) {
      setCurrentStep(newStep);
    }
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Use both scroll and scrollend for reliability
    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollend", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", handleScroll);
    };
  }, [handleScroll]);

  // Align label backgrounds with page gradient (frozen during keyboard to avoid iOS compositor bug)
  const isKeyboardOpen = useRef(false);

  useLayoutEffect(() => {
    const updateLabelBackgrounds = () => {
      // Don't update during keyboard animation - freeze at last good state
      if (isKeyboardOpen.current) return;

      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);

      const container = scrollContainerRef.current;
      if (!container) return;

      const labels = container.querySelectorAll(
        `.${styles.inputLabel}, .${styles.fieldError}`
      ) as NodeListOf<HTMLElement>;

      labels.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--bg-y", `${-rect.top}px`);
      });
    };

    const onFocusIn = () => {
      isKeyboardOpen.current = true;
    };

    const onFocusOut = () => {
      isKeyboardOpen.current = false;
      // Resume updates after keyboard closes
      requestAnimationFrame(updateLabelBackgrounds);
    };

    updateLabelBackgrounds();
    const raf = requestAnimationFrame(updateLabelBackgrounds);

    window.addEventListener("resize", updateLabelBackgrounds);
    window.addEventListener("orientationchange", updateLabelBackgrounds);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", updateLabelBackgrounds, {
      passive: true,
    });

    const ro = new ResizeObserver(updateLabelBackgrounds);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateLabelBackgrounds);
      window.removeEventListener("orientationchange", updateLabelBackgrounds);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      container?.removeEventListener("scroll", updateLabelBackgrounds);
      ro.disconnect();
    };
  }, []);

  // Touch handlers for back gesture on first page
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (scrollContainerRef.current) {
      touchStartScrollLeft.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartScrollLeft.current === null)
      return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const slideWidth = container.offsetWidth;
    const startStep = Math.round(touchStartScrollLeft.current / slideWidth);

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    // On step 0:
    if (startStep === 0) {
      // Swiped left (back) = go to login
      if (diff < -50) {
        onBack();
      }
      // Swiped right (forward) but form invalid = show errors
      else if (diff > 50 && !isStep0Valid) {
        validateStep0();
      }
    }

    touchStartX.current = null;
    touchStartScrollLeft.current = null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    let shouldResetLoading = true;

    try {
      let userId: string;

      if (signupType === "email") {
        await authService.signUp(email, password);
        const user = await authService.getCurrentUser();

        if (!user) throw new Error("שגיאה ביצירת חשבון");
        userId = user.id;
      } else {
        userId = googleUserId!;
      }

      const cleanPhone = phone.replace(/[-\s]/g, "");

      await userService.completeProfile(userId, email, {
        full_name: fullName.trim(),
        phone: cleanPhone,
        gender: gender || undefined,
        circle: circle || undefined,
        proximity: proximity || undefined,
        interests: interests.length ? interests : undefined,
        branches: branches.length ? branches : undefined,
        free_text: freeText || undefined,
      });

      // Keep loading while navigating
      shouldResetLoading = false;
      router.replace("/pending-approval");
    } catch (err: any) {
      setError(err.message || "שגיאה בשמירה");
    } finally {
      if (shouldResetLoading) {
        setLoading(false);
      }
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleBranch = (branchValue: string) => {
    setBranches((prev) =>
      prev.includes(branchValue)
        ? prev.filter((b) => b !== branchValue)
        : [...prev, branchValue]
    );
  };

  // Progress circle SVG paths (organic blob shapes)
  const getProgressCircleIcon = (stepIndex: number, isCurrent: boolean) => {
    const suffix = isCurrent ? "_filled" : "";
    return `/icons/progress_circle_${stepIndex + 1}${suffix}.svg`;
  };

  // Track arrow visibility per step
  const [arrowVisible, setArrowVisible] = useState(false);
  const arrowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle arrow visibility based on current step
  useEffect(() => {
    // Clear any existing timer
    if (arrowTimerRef.current) {
      clearTimeout(arrowTimerRef.current);
    }

    // Hide arrow initially when step changes
    setArrowVisible(false);

    // Don't show on last step
    if (currentStep >= 4) return;

    if (currentStep === 0) {
      // Step 0: Show immediately when valid
      if (isStep0Valid) {
        // Small delay to trigger animation
        arrowTimerRef.current = setTimeout(() => {
          setArrowVisible(true);
        }, 100);
      }
    } else {
      // Steps 1-3: Show after 2.5 seconds delay
      arrowTimerRef.current = setTimeout(() => {
        setArrowVisible(true);
      }, 2500);
    }

    return () => {
      if (arrowTimerRef.current) {
        clearTimeout(arrowTimerRef.current);
      }
    };
  }, [currentStep, isStep0Valid]);

  // Arrow SVG component
  const NextArrow = () => (
    <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M39.1051 15.1008C38.2046 11.1206 37.4512 7.97787 34.7767 5.51052C34.3024 5.07227 33.8552 4.73909 33.489 4.48695C33.1108 4.24082 32.3484 3.39735 31.8711 3.1152C26.204 -0.222638 19.2702 -1.11413 12.9757 1.60237C7.68678 3.88662 3.51749 8.68326 1.3443 14.0082C0.49783 16.0853 0.320732 18.4326 0.305724 20.5878C0.299721 21.5663 0.743965 24.8021 1.40433 26.2879C1.40433 26.2879 1.40133 26.2819 1.39833 26.2819C1.94162 28.7013 5.05434 32.4323 7.1765 34.1433C12.8766 38.7418 20.888 42.3888 27.6898 38.0664C30.5083 36.2744 35.5601 31.6609 37.6853 29.0945C39.1681 27.3025 39.9365 24.7751 39.9906 22.4188C40.0446 20.1105 39.8645 18.4476 39.1051 15.1008ZM2.04668 19.5853C2.0857 19.114 2.33184 17.5982 2.43389 17.0489C3.83567 11.7119 7.40163 6.87026 12.1292 3.88062C18.0365 0.146566 33.477 0.473745 36.7758 12.6094C37.139 13.9452 37.7843 17.1719 37.9464 18.4506C37.9464 18.4596 37.9464 18.4626 37.9464 18.4686C38.0665 22.4038 39.2642 23.4964 36.1695 28.203C33.9392 30.5233 31.5499 32.6424 29.0375 34.8547C26.258 37.298 22.8781 38.7988 19.0901 37.9974C14.0953 36.9378 9.66187 34.2243 6.22198 30.5233C4.35195 28.5092 3.3554 26.2879 2.51794 23.9016C2.09771 22.704 1.96864 20.4737 2.04668 19.5853Z" fill="white"/>
      <path d="M11 19.9961L28.9998 19.9854" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
      <path d="M17.225 13L11 19.975" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
      <path d="M10.9996 20L17.2246 26.975" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
    </svg>
  );

  // Determine which params to use based on current step
  const activeCircleParams = useMemo(() => {
    if (currentStep <= 1) {
      // Steps 0-1: Use layerCount with default params
      return {
        layers: layerCount,
        smoothness: defaultParams.smoothness,
        complexity: defaultParams.complexity,
        elongation: defaultParams.elongation,
        opacity: 0.8,
        strokeWidth: 1,
      };
    } else {
      // Steps 2-4: Use calculated params
      return calculatedParams;
    }
  }, [currentStep, layerCount, defaultParams, calculatedParams]);

  return (
    <SmoothPageWrapper isLoading={loading}>
      <div className={styles.wizardContainer}>
        {/* Fixed Background Circles - stays in place during swipe */}
        <div className={styles.backgroundCircles}>
          <OrganicCircles
            key={`background-circles-${activeCircleParams.layers}-${activeCircleParams.complexity}-${activeCircleParams.opacity}-${activeCircleParams.smoothness}-${activeCircleParams.strokeWidth}-${activeCircleParams.elongation}`}
            mode="static"
            radius={circleRadius}
            layers={activeCircleParams.layers}
            smoothness={activeCircleParams.smoothness}
            complexity={activeCircleParams.complexity}
            elongation={activeCircleParams.elongation}
            opacity={activeCircleParams.opacity}
            strokeWidth={activeCircleParams.strokeWidth}
            position={circlePosition}
            baseColor="#FFFFFF"
          />
        </div>

        {/* Scroll Snap Container - locked until step 0 is valid */}
      <div
        ref={scrollContainerRef}
        className={`${styles.scrollSnapContainer} ${
          !isStep0Valid ? styles.scrollLocked : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Step 0: Personal Details - Uses layerCount only */}
        <div className={styles.scrollSnapSlide}>
          {/* Arrow for Step 0 - with swipe hint animation */}
          {currentStep === 0 && (
            <button
              className={`${styles.nextArrow} ${arrowVisible ? styles.nextArrowSwipeHint : styles.nextArrowHidden}`}
              type="button"
              aria-label="המשך"
            >
              <NextArrow />
            </button>
          )}
          <div className={styles.content}>
            {/* Spacer for fixed circles */}
            <div className={styles.circleSpacer} />

            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t("השלם/י פרטים אישיים")}</h2>
              <p className={styles.optionalSubtitle}>&nbsp;</p>
            </div>

            <div className={styles.stepContainer}>
              <div className={styles.inputsContainer}>
                <CutInput
                  label="שם מלא"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setNameError("");
                  }}
                  error={nameError}
                  dir="rtl"
                  textAlign="right"
                />

                <CutInput
                  label="מספר טלפון"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  error={phoneError}
                  dir="rtl"
                  textAlign="right"
                />

                <div className={styles.genderSelector}>
                  <div className={styles.genderWrapper}>
                    {/* SVG Border with gap for label */}
                    <svg
                      className={styles.genderBorder}
                      viewBox="0 0 315 61"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M286 0.5H306C308.5 0.5 314 2 314.5 8.5C314.5 15.3 314.5 39.3333 314.5 50.5C314.5 53.3333 312.8 59.1 306 59.5C299.2 59.9 105.5 59.6667 9.5 59.5C7 59.5 1 58.5 0.5 52C0.5 45.2 0.5 20.1667 0.5 8.5C0.5 6 2 1 8 0.5C14.8 0.5 172.333 0.5 254 0.5"
                        className={styles.genderBorderPath}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={styles.genderLabel}>מין</span>
                    <button
                      type="button"
                      onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                      className={`${styles.genderToggle} ${
                        genderDropdownOpen ? styles.open : ""
                      }`}
                    >
                      <span
                        className={!gender ? styles.accordionPlaceholder : ""}
                      >
                        {gender
                          ? GENDER_OPTIONS.find((g) => g.value === gender)
                              ?.label
                          : t("בחר/י")}
                      </span>
                      <span
                        className={`${styles.genderToggleArrow} ${
                          genderDropdownOpen ? styles.open : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                  </div>
                  {genderDropdownOpen && (
                    <div className={styles.genderDropdown}>
                      {GENDER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setGender(option.value);
                            setIvritaGender(option.value);
                            setGenderDropdownOpen(false);
                          }}
                          className={`${styles.genderOption} ${
                            gender === option.value ? styles.selected : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Branch Selection - Uses layerCount only (no calculator) */}
        <div className={styles.scrollSnapSlide}>
          {/* Arrow for Step 1 */}
          {currentStep === 1 && (
            <button
              className={`${styles.nextArrow} ${arrowVisible ? styles.nextArrowVisible : styles.nextArrowHidden}`}
              type="button"
              aria-label="המשך"
            >
              <NextArrow />
            </button>
          )}
          <div className={styles.content}>
            {/* Spacer for fixed circles */}
            <div className={styles.circleSpacer} />

            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>
                הסניף הקרוב אליך
              </h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            <div className={styles.stepContainerLower}>
              <div className={styles.optionsContainer}>
                {BRANCH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleBranch(option.value)}
                    className={`${styles.optionButton} ${
                      branches.includes(option.value) ? styles.selected : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Interests - Uses CALCULATED PARAMS */}
        <div className={styles.scrollSnapSlide}>
          {/* Arrow for Step 2 */}
          {currentStep === 2 && (
            <button
              className={`${styles.nextArrow} ${arrowVisible ? styles.nextArrowVisible : styles.nextArrowHidden}`}
              type="button"
              aria-label="המשך"
            >
              <NextArrow />
            </button>
          )}
          <div className={styles.content}>
            {/* Spacer for fixed circles */}
            <div className={styles.circleSpacer} />

            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t("מה מעניין אותך?")}</h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            <div className={styles.stepContainerLower}>
              <div className={styles.optionsContainer}>
                {INTEREST_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleInterest(option)}
                    className={`${styles.optionButton} ${
                      interests.includes(option) ? styles.selected : ""
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Circle Selection - Uses CALCULATED PARAMS */}
        <div className={styles.scrollSnapSlide}>
          {/* Arrow for Step 3 */}
          {currentStep === 3 && (
            <button
              className={`${styles.nextArrow} ${arrowVisible ? styles.nextArrowVisible : styles.nextArrowHidden}`}
              type="button"
              aria-label="המשך"
            >
              <NextArrow />
            </button>
          )}
          <div className={styles.content}>
            {/* Spacer for fixed circles */}
            <div className={styles.circleSpacer} />

            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>
                {t("מאיזה מקום אישי את/ה מגיע/ה אלינו?")}
              </h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            <div className={styles.stepContainerLower}>
              <div className={styles.inputsContainer}>
                <div className={styles.accordionContainer}>
                  <div className={styles.inputWrapper}>
                    <button
                      type="button"
                      onClick={() => setCircleDropdownOpen(!circleDropdownOpen)}
                      className={`${styles.accordionHeader} ${
                        circleDropdownOpen ? styles.open : ""
                      }`}
                    >
                      <span
                        className={!circle ? styles.accordionPlaceholder : ""}
                      >
                        {circle || "בחר"}
                      </span>
                      <span
                        className={`${styles.accordionArrow} ${
                          circleDropdownOpen ? styles.open : ""
                        }`}
                      ></span>
                    </button>
                  </div>
                  {circleDropdownOpen && (
                    <div className={styles.accordionDropdown}>
                      {CIRCLE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setCircle((prev) =>
                              prev === option ? "" : option
                            );
                            setCircleDropdownOpen(false);
                          }}
                          className={`${styles.accordionOption} ${
                            circle === option ? styles.selected : ""
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!circleDropdownOpen && circle === "אחר" && (
                  <CutInput
                    label="אחר"
                    type="text"
                    value={proximity}
                    onChange={(e) => setProximity(e.target.value)}
                    placeholder="אם מתאים לך, אפשר לפרט כאן (לא חובה)"
                    dir="rtl"
                    textAlign="right"
                    placeholderAlign="center"
                    tall
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Free Text - Uses CALCULATED PARAMS */}
        <div className={styles.scrollSnapSlide}>
          <div className={styles.content}>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>&nbsp;</h2>
              <p className={styles.optionalSubtitle}>&nbsp;</p>
            </div>

            {/* Spacer for fixed circles */}
            <div className={styles.circleSpacer} />

            <div className={styles.stepContainerLower}>
              <div className={styles.inputsContainer}>
                <h2 className={styles.step4Title}>
                  {t("*כל דבר אחר שתרצה/י שנדע:")}
                </h2>

                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>אחר</span>
                  <textarea
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    className={styles.textarea}
                    rows={1}
                    dir="rtl"
                  />
                </div>

                <Button
                  variant="approve"
                  onClick={handleSubmit}
                  disabled={loading}
                  customBgColor="#b37eb3"
                  style={{ alignSelf: 'center' }}
                >
                  {loading ? "..." : "סיום"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Progress Circles - Fixed at bottom */}
      <div className={styles.navigation}>
        <div className={styles.progressDots}>
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={styles.progressCircle}
            >
              <img
                src={getProgressCircleIcon(step, step === currentStep)}
                alt=""
                className={styles.progressCircleIcon}
              />
            </div>
          ))}
        </div>
      </div>
      </div>
    </SmoothPageWrapper>
  );
}
