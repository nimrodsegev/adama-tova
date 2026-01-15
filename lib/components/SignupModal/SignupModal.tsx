"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
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

  const handleClose = () => {
    // Reset state when closing
    setEmail("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={handleClose} />
      <div className={styles.modalContainer}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={handleClose}>
          <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <line x1="2" y1="2" x2="18" y2="18" stroke="#F9F9F9" strokeWidth="1" />
            <line x1="18" y1="2" x2="2" y2="18" stroke="#F9F9F9" strokeWidth="1" />
          </svg>
        </button>

        {/* Content */}
        <div className={styles.content}>
          {/* Headline */}
          <h2 className={styles.headline}>
            היי. אנא מלא את הפרטים הבאים:
          </h2>

          {/* Inputs */}
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
              label="סיסמה"
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
            {loading ? "בודק..." : "התקדם"}
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
