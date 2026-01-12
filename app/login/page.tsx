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
  const [loadingAction, setLoadingAction] = useState<"login" | "signup" | null>(null);
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
          const supabase = createClient();
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!profile || !profile.quiz?.completed_at) {
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

  const validatePassword = (password: string): boolean => {
    return password.length < 6;
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

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email || !password) {
      return;
    }

    setLoadingAction("login");

    try {
      const userExists = await checkUserExists(email);

      if (!userExists) {
        setEmailError("אימייל לא נמצא");
        setLoadingAction(null);
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
            if (!profile.is_approved && profile.role === "participant") {
              router.replace("/pending-approval");
              setLoadingAction(null);
              return;
            }

            if (!profile.quiz?.completed_at) {
              router.replace("/login");
              setLoadingAction(null);
              return;
            }

            if (profile.role === "admin") {
              router.replace("/AdminScreens/HomePage");
            } else {
              router.replace("/UserScreens/HomePage");
            }
          } else {
            setEmailError("שגיאה בטעינת פרופיל");
          }
        }
      } catch (authError: any) {
        setPasswordError("סיסמה שגויה");
      }
    } catch (err: any) {
      // Error handled
    } finally {
      setLoadingAction(null);
    }
  };

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

    setLoadingAction("signup");
    const userExists = await checkUserExists(email);
    setLoadingAction(null);

    if (userExists) {
      setEmailError("אימייל קיים במערכת");
      return;
    }

    setSignupType("email");
    setSignupEmail(email);
    setSignupPassword(password);
    setMode("signup");
  };

  const handleBackToLogin = async () => {
    setMode("choice");
    if (signupType === "google") {
      await authService.signOut();
    }
  };

  if (!initialCheckDone) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.content}>
          <div className={styles.greeting}>
            <p>טוען...</p>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (mode === "choice") {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.content}>
          <div className={styles.mainSection}>
            {/* Greeting section */}
            <div className={styles.greeting}>
              <h1>ברוכה הבאה</h1>
              <p>להרשמה או התחברות הכניסו פרטים</p>
            </div>

            <div className={styles.loginContent}>
              {/* Input Wrapper - Email (first) */}
              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>אימייל</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="adama_tova@gmail.com"
                  className={`${styles.input} ${styles.inputLtr} ${
                    emailError ? styles.inputError : ""
                  }`}
                  dir="ltr"
                />
                {emailError && (
                  <span className={styles.fieldError}>{emailError}</span>
                )}
              </div>

              {/* Input Wrapper - Password (second) */}
              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>סיסמה</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="6 תווים או יותר"
                  className={`${styles.input} ${
                    passwordError ? styles.inputError : ""
                  }`}
                  dir="rtl"
                />
                {passwordError && (
                  <span className={styles.fieldError}>{passwordError}</span>
                )}
              </div>

              {/* Action Buttons - New order per Image 1 */}
              <div className={styles.buttonSection}>
                {/* 1. התחבר (Login) */}
                <button
                  className={styles.primaryButton}
                  onClick={handleLogin}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === "login" ? "מתחבר..." : "התחבר"}
                </button>

                {/* 2. או (OR separator) */}
                <div className={styles.orSeparator}>
                  <span className={styles.orLine}></span>
                  <span className={styles.orText}>או</span>
                  <span className={styles.orLine}></span>
                </div>

                {/* 3. התחבר עם גוגל (Google) */}
                <GoogleLoginButton className={styles.googleButton} />

                {/* 4. יצירת משתמש (Create User) */}
                <button
                  className={styles.secondaryButton}
                  onClick={handleSignupClick}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === "signup" ? "טוען..." : "צור משתמש"}
                </button>

                {/* 5. שכחתי סיסמה (Forgot Password) - Outside, at bottom with arrow */}
                <button
                  className={styles.forgotPassword}
                  onClick={() => setShowForgotPassword(true)}
                  type="button"
                >
                  שכחתי סיסמה
                  <span className={styles.forgotPasswordArrow}></span>
                </button>
              </div>
            </div>
          </div>

          {/* About Link - "מי אנחנו?" */}
          <a href="/login/about" className={styles.aboutLink}>
            מי אנחנו?
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