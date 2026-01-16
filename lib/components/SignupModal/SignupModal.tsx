"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/contexts/UserContext";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import CutInput from "@/lib/components/UI/CutInput";
import styles from "./SignupModal.module.css";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (email: string, password: string) => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onProceed,
}: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const { userProfile } = useUser();

  // Calculate shape parameters for OrganicCircles
  const shapeParams = useMemo(() => {
    return calculateShapeParams(userProfile);
  }, [userProfile]);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle entering animation when modal opens
  useEffect(() => {
    if (isOpen && mounted && !hasEntered) {
      const timer = setTimeout(() => {
        setHasEntered(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted, hasEntered]);

  // Reset hasEntered when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasEntered(false);
    }
  }, [isOpen]);

  // Email validation
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "אימייל הוא שדה חובה";
    }
    if (!emailRegex.test(email)) {
      return "אימייל לא תקין";
    }
    return null;
  };

  // Password validation - must be at least 6 characters
  const validatePassword = (password: string): boolean => {
    return password.length < 6;
  };

  // Check if user already exists in database
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      return !!data;
    } catch {
      return false;
    }
  };

  const handleProceed = async () => {
    // Clear previous errors
    setEmailError("");
    setPasswordError("");

    // Validate email format
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    // Validate password length
    const passwordInvalid = validatePassword(password);
    if (passwordInvalid) {
      setPasswordError("סיסמה חלשה");
      return;
    }

    setLoading(true);

    // Check if email already exists
    const userExists = await checkUserExists(email);
    if (userExists) {
      setEmailError("אימייל קיים במערכת");
      setLoading(false);
      return;
    }

    // All validations passed - proceed to signup wizard
    onProceed(email, password);
  };

  // Handle close with animation
  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      // Reset state when closing
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
      setLoading(false);
      setClosing(false);
      onClose();
    }, 500);
  };

  if (!isOpen || !mounted) return null;

  // Show loading animation when entering (not yet entered) or closing
  const showLoadingAnimation = !hasEntered || closing;

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={handleCloseWithAnimation} />
      <div className={styles.modalContainer}>
        {/* OrganicCircles loading animation */}
        {showLoadingAnimation && (
          <OrganicCircles
            mode="loading"
            radius={0.3}
            layers={shapeParams.layers}
            smoothness={shapeParams.smoothness}
            complexity={shapeParams.complexity}
            elongation={shapeParams.elongation}
            opacity={shapeParams.opacity}
            strokeWidth={shapeParams.strokeWidth}
            position={{ x: 0.5, y: 0.5 }}
            baseColor="#FFFFFF"
          />
        )}

        {/* Close Button */}
        <button className={styles.closeButton} onClick={handleCloseWithAnimation}>
          <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <line x1="2" y1="2" x2="18" y2="18" stroke="#F9F9F9" strokeWidth="1" />
            <line x1="18" y1="2" x2="2" y2="18" stroke="#F9F9F9" strokeWidth="1" />
          </svg>
        </button>

        {/* Content - hidden during loading animation */}
        {!showLoadingAnimation && (
          <div className={styles.content}>
            {/* Greeting */}
            <div className={styles.greeting}>
              <h2 className={styles.headline}>יצירת משתמש</h2>
              <p className={styles.subtitle}>ליצירת המשתמש מלא/י את הפרטים</p>
            </div>

            {/* Inputs and Button */}
            <div className={styles.formSection}>
              <div className={styles.inputsContainer}>
                {/* Email Input */}
                <CutInput
                  label="אימייל"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="adama_tova@gmail.com"
                  error={emailError}
                  dir="ltr"
                  textAlign="right"
                />

                {/* Password Input */}
                <CutInput
                  label="ססמא"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="6 תווים או יותר"
                  error={passwordError}
                  dir="rtl"
                  textAlign="right"
                />
              </div>

              {/* Proceed Button */}
              <button
                className={styles.proceedButton}
                onClick={handleProceed}
                disabled={loading}
              >
                {loading ? "בודק..." : "המשך למילוי פרטים"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
