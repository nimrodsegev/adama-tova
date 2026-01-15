"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/app/services/authService";
import GoogleLoginButton from "./GoogleLoginButton";
import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/client";
import ForgotPasswordModal from "@/lib/components/ForgotPasswordModal";
import SignupModal from "@/lib/components/SignupModal/SignupModal";
import SignupWizard from "@/app/ApplicationForm/SignupWizard";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import CutInput from "@/lib/components/UI/CutInput";
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
  const [showSignupModal, setShowSignupModal] = useState(false);

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
    let shouldResetLoading = true;

    try {
      const userExists = await checkUserExists(email);

      if (!userExists) {
        setEmailError("אימייל לא נמצא");
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
              shouldResetLoading = false;
              router.replace("/pending-approval");
              return;
            }

            if (!profile.quiz?.completed_at) {
              shouldResetLoading = false;
              router.replace("/login");
              return;
            }

            shouldResetLoading = false;
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
      if (shouldResetLoading) {
        setLoadingAction(null);
      }
    }
  };

  const handleSignupClick = () => {
    setShowSignupModal(true);
  };

  const handleSignupProceed = (modalEmail: string, modalPassword: string) => {
    // Close modal and transition to signup wizard
    setShowSignupModal(false);
    setSignupType("email");
    setSignupEmail(modalEmail);
    setSignupPassword(modalPassword);
    setMode("signup");
  };

  const handleBackToLogin = async () => {
    setMode("choice");
    // Brief delay to allow smooth animation to play before revealing login
    setTimeout(() => setLoadingAction(null), 50);
    if (signupType === "google") {
      await authService.signOut();
    }
  };

  // LOGIN SCREEN
  if (mode === "choice") {
    return (
      <SmoothPageWrapper isLoading={!initialCheckDone || loadingAction !== null}>
        <div className={styles.loginContainer}>
        <div className={styles.content}>
          <div className={styles.mainSection}>
            {/* Greeting section */}
            <div className={styles.greeting}>
              <h1>ברוכה הבאה</h1>
              <p>להרשמה או התחברות הכניסו פרטים</p>
            </div>

            <div className={styles.loginContent}>
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

              {/* Action Buttons */}
              <div className={styles.buttonSection}>
                {/* 1. Row with Login + Google buttons side by side */}
                <div className={styles.buttonRow}>
                  <button
                    className={styles.loginButtonSmall}
                    onClick={handleLogin}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === "login" ? "מתחבר..." : "התחבר"}
                  </button>
                  <GoogleLoginButton className={styles.googleButtonSmall} />
                </div>

                {/* 2. או (OR separator) */}
                <div className={styles.orSeparator}>
                  <span className={styles.orLine}></span>
                  <span className={styles.orText}>או</span>
                  <span className={styles.orLine}></span>
                </div>

                {/* 3. יצירת משתמש (Create User) - full width */}
                <button
                  className={styles.secondaryButton}
                  onClick={handleSignupClick}
                  disabled={loadingAction !== null}
                >
                  צור משתמש
                </button>

                {/* 4. שכחתי סיסמה (Forgot Password) - with arrow */}
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

        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onProceed={handleSignupProceed}
        />
        </div>
      </SmoothPageWrapper>
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