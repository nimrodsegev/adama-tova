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

      router.replace("/pending-approval");
    } catch (err: any) {
      setError(err.message || "שגיאה בשמירה");
    } finally {
      setLoading(false);
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

  // Get dot class based on step state - fills up progressively
  const getDotClass = (stepIndex: number) => {
    if (stepIndex <= currentStep) return `${styles.dot} ${styles.filledDot}`;
    return styles.dot;
  };

  return (
    <div className={styles.wizardContainer}>
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
          <div className={styles.content}>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t("השלם/י פרטים אישיים")}</h2>
              <p className={styles.optionalSubtitle}>&nbsp;</p>
            </div>

            <div className={styles.decorativeCircles}>
              <OrganicCircles
                key={`circles-step0-${layerCount}`}
                mode="static"
                radius={circleRadius}
                layers={layerCount}
                smoothness={defaultParams.smoothness}
                complexity={defaultParams.complexity}
                elongation={defaultParams.elongation}
                opacity={0.8}
                strokeWidth={1}
                position={circlePosition}
                baseColor="#FFFFFF"
              />
            </div>

            <div className={styles.stepContainer}>
              <div className={styles.inputsContainer}>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>שם מלא</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setNameError("");
                    }}
                    className={`${styles.input} ${
                      nameError ? styles.inputError : ""
                    }`}
                    dir="rtl"
                  />
                  {nameError && (
                    <span className={styles.fieldError}>{nameError}</span>
                  )}
                </div>

                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>מספר טלפון</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError("");
                    }}
                    className={`${styles.input} ${
                      phoneError ? styles.inputError : ""
                    }`}
                    dir="rtl"
                  />
                  {phoneError && (
                    <span className={styles.fieldError}>{phoneError}</span>
                  )}
                </div>

                <div className={styles.genderSelector}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>מין</span>
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
          <div className={styles.content}>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>
                {t("הסניף הקרוב [אליך|אלייך]")}
              </h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            <div className={styles.decorativeCircles}>
              <OrganicCircles
                key={`circles-step1-${layerCount}`}
                mode="static"
                radius={circleRadius}
                layers={layerCount}
                smoothness={defaultParams.smoothness}
                complexity={defaultParams.complexity}
                elongation={defaultParams.elongation}
                opacity={0.8}
                strokeWidth={1}
                position={circlePosition}
                baseColor="#FFFFFF"
              />
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
          <div className={styles.content}>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>{t("מה מעניין אותך?")}</h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            <div className={styles.decorativeCircles}>
              <OrganicCircles
                key={`circles-step2-${interests.length}-${calculatedParams.layers}-${calculatedParams.complexity}`}
                mode="static"
                radius={circleRadius}
                layers={calculatedParams.layers}
                smoothness={calculatedParams.smoothness}
                complexity={calculatedParams.complexity}
                elongation={calculatedParams.elongation}
                opacity={calculatedParams.opacity}
                strokeWidth={calculatedParams.strokeWidth}
                position={circlePosition}
                baseColor="#FFFFFF"
              />
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
          <div className={styles.content}>
            <div className={styles.headerSection}>
              <h2 className={styles.stepTitle}>
                {t("מאיזה מקום אישי את/ה מגיע/ה אלינו?")}
              </h2>
              <p className={styles.optionalSubtitle}>*לא חובה</p>
            </div>

            <div className={styles.decorativeCircles}>
              <OrganicCircles
                key={`circles-step3-${circle}-${calculatedParams.layers}-${calculatedParams.opacity}`}
                mode="static"
                radius={circleRadius}
                layers={calculatedParams.layers}
                smoothness={calculatedParams.smoothness}
                complexity={calculatedParams.complexity}
                elongation={calculatedParams.elongation}
                opacity={calculatedParams.opacity}
                strokeWidth={calculatedParams.strokeWidth}
                position={circlePosition}
                baseColor="#FFFFFF"
              />
            </div>

            <div className={styles.stepContainerLower}>
              <div className={styles.inputsContainer}>
                <div className={styles.accordionContainer}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>
                      {t("מאיזה מקום אישי את/ה מגיע/ה אלינו?")}
                    </span>
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
                        {circle || t("בחר/י")}
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

                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>אחר</span>
                  <textarea
                    value={proximity}
                    onChange={(e) => setProximity(e.target.value)}
                    className={styles.textareaLarge}
                    dir="rtl"
                  />
                </div>
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

            <div className={styles.decorativeCircles}>
              <OrganicCircles
                key={`circles-step4-${freeText.length}-${calculatedParams.layers}`}
                mode="static"
                radius={circleRadius}
                layers={calculatedParams.layers}
                smoothness={calculatedParams.smoothness}
                complexity={calculatedParams.complexity}
                elongation={calculatedParams.elongation}
                opacity={calculatedParams.opacity}
                strokeWidth={calculatedParams.strokeWidth}
                position={circlePosition}
                baseColor="#FFFFFF"
              />
            </div>

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

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? "..." : "סיום"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Progress Diamonds - Fixed at bottom */}
      <div className={styles.navigation}>
        <div className={styles.progressDots}>
          {[0, 1, 2, 3, 4].map((step) => (
            <div key={step} className={getDotClass(step)} />
          ))}
        </div>
      </div>
    </div>
  );
}
