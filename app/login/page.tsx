"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/app/services/authService";
import GoogleLoginButton from "./GoogleLoginButton";
import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/client";
import ForgotPasswordModal from "@/lib/components/ForgotPasswordModal";
import SignupWizard from "@/app/ApplicationForm/SignupWizard";
import { useState, useEffect } from "react";

type Mode = "choice" | "signup";
type SignupType = "email" | "google";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choice");
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Field-specific errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Store signup info for wizard
  const [signupType, setSignupType] = useState<SignupType>("email");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [googleUserId, setGoogleUserId] = useState("");

  // 🔥 Check ONLY for Google OAuth users who need to complete profile
  useEffect(() => {
    const checkAuthUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();

        if (currentUser && mode === "choice") {
          // User is authenticated via Google - check if they have a profile
          const supabase = createClient();

          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle(); // ✅ FIXED: Returns null instead of throwing 406

          if (!profile || !profile.quiz?.completed_at) {
            // Google user without profile or incomplete quiz - show wizard
            setSignupType("google");
            setGoogleUserId(currentUser.id);
            setSignupEmail(currentUser.email || "");
            setMode("signup");
          }
        }
      } catch (error) {
        // No user - continue to login screen
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkAuthUser();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "הסיסמה חייבת להכיל לפחות 8 תווים";
    }
    if (!/[A-Z]/.test(password)) {
      return "הסיסמה חייבת להכיל לפחות אות גדולה אחת באנגלית";
    }
    if (!/[a-z]/.test(password)) {
      return "הסיסמה חייבת להכיל לפחות אות קטנה אחת באנגלית";
    }
    if (!/[0-9]/.test(password)) {
      return "הסיסמה חייבת להכיל לפחות ספרה אחת";
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "אימייל הוא שדה חובה";
    }
    if (!emailRegex.test(email)) {
      return "פורמט האימייל לא תקין";
    }
    return null;
  };

  // 🔥 FIXED: Handle no rows gracefully
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle(); // ✅ FIXED: Returns null instead of throwing 406

      return !!data;
    } catch {
      return false;
    }
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email || !password) {
      return;
    }

    setLoading(true);

    try {
      const userExists = await checkUserExists(email);

      if (!userExists) {
        setEmailError("אימייל לא נמצא");
        setLoading(false);
        return;
      }

      try {
        await authService.signIn(email, password);

        const user = await authService.getCurrentUser();
        if (user) {
          const supabase = createClient();
          const { data: profile } = await supabase
            .from("users")
            .select("is_approved, role, quiz")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            // Check approval status first
            if (!profile.is_approved && profile.role === "participant") {
              router.replace("/pending-approval");
              setLoading(false);
              return;
            }

            // Check quiz completion
            if (!profile.quiz?.completed_at) {
              router.replace("/login"); // Show wizard
              setLoading(false);
              return;
            }

            // 🔥 FIXED: Navigate to correct dashboard
            if (profile.role === "admin") {
              router.replace("/adminScreens/HomePage");
            } else {
              router.replace("/UserScreens/HomePage");
            }
          } else {
            // No profile exists - should not happen for existing users
            setEmailError("שגיאה בטעינת פרופיל");
          }
        }
      } catch (authError: any) {
        setPasswordError("סיסמה שגויה");
      }
    } catch (err: any) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  // Just validate and show wizard (DON'T create auth account yet)
  const handleSignupClick = async () => {
    setEmailError("");
    setPasswordError("");

    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError("אימייל לא תקין");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError("סיסמה חלשה");
      return;
    }

    setLoading(true);
    const userExists = await checkUserExists(email);
    setLoading(false);

    if (userExists) {
      setEmailError("אימייל קיים במערכת");
      return;
    }

    // Store email/password and show wizard (don't create account yet)
    setSignupType("email");
    setSignupEmail(email);
    setSignupPassword(password);
    setMode("signup");
  };

  // Handle back from wizard
  const handleBackToLogin = async () => {
    setMode("choice");

    // If it was a Google signup, sign them out
    if (signupType === "google") {
      await authService.signOut();
    }
  };

  if (!initialCheckDone) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div
            style={{
              color: "#EFEFEF",
              fontFamily: "Ezer Shemesh TRIAL ONLY, sans-serif",
              fontSize: "1.25rem",
              textAlign: "center",
            }}
          >
            ...טוען
          </div>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (mode === "choice") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.greeting}>
            <h1 className={styles.title}>ברוכה הבאה</h1>
            <p className={styles.subtitle}>להרשמה או התחברות הכניסו פרטים</p>
          </div>

          <div className={styles.loginContent}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className={`${styles.input} ${styles.inputLtr} ${
                  emailError ? styles.inputError : ""
                }`}
                dir="rtl"
              />
              <span className={styles.inputLabel}>אימייל</span>
              {emailError && (
                <span className={styles.fieldError}>{emailError}</span>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                className={`${styles.input} ${
                  passwordError ? styles.inputError : ""
                }`}
                dir="rtl"
              />
              <span className={styles.inputLabel}>סיסמה</span>
              {passwordError && (
                <span className={styles.fieldError}>{passwordError}</span>
              )}

              <button
                className={styles.forgotPassword}
                onClick={() => setShowForgotPassword(true)}
                type="button"
              >
                שכחתי סיסמה
              </button>
            </div>

            <div className={styles.buttonSection}>
              <button
                className={styles.primaryButton}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "...מתחבר" : "התחבר"}
              </button>

              <button
                className={styles.secondaryButton}
                onClick={handleSignupClick}
                disabled={loading}
              >
                יצירת משתמש
              </button>

              <div className={styles.orSeparator}>
                <span className={styles.orLine}></span>
                <span className={styles.orText}>או</span>
                <span className={styles.orLine}></span>
              </div>

              <GoogleLoginButton className={styles.googleButton} />
            </div>
          </div>

          {/* Link to About Page */}
          <a href="/login/about" className={styles.aboutLink}>
            אודות העמותה
          </a>
        </div>

        {showForgotPassword && (
          <ForgotPasswordModal
            email={email}
            onClose={() => setShowForgotPassword(false)}
          />
        )}
      </div>
    );
  }

  // SIGNUP WIZARD
  return (
    <SignupWizard
      signupType={signupType}
      email={signupEmail}
      password={signupPassword}
      googleUserId={googleUserId}
      onBack={handleBackToLogin}
    />
  );
}
