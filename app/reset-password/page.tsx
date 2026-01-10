"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [success, setSuccess] = useState(false);

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const initSessionFromUrl = async () => {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      let exchangeError = null;

      // Try to establish session from URL tokens
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Password reset code exchange error:', error);
          exchangeError = error;
        }
        // Clean URL
        window.history.replaceState({}, document.title, url.pathname);
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error('Password reset session error:', error);
          exchangeError = error;
        }
        // Clean URL
        window.history.replaceState({}, document.title, url.pathname);
      }

      // Verify we have a valid session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (exchangeError) {
          setSessionError('הקישור לא תקף. יש לפתוח את הקישור מאותו מכשיר בו ביקשת לאפס את הסיסמה, ולוודא שאינך בגלישה פרטית.');
        } else if (code || accessToken) {
          setSessionError('הקישור פג תוקף. אנא בקשו קישור חדש.');
        } else {
          setSessionError('שגיאה - אנא בקשו לינק חדש בדף ההתחברות');
        }
      }

      setCheckingSession(false);
    };

    void initSessionFromUrl();
  }, []);

  const validatePassword = (password: string): boolean => {
    return password.length < 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordError('');
    setConfirmPasswordError('');

    if (validatePassword(password)) {
      setPasswordError('סיסמה חלשה');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('same') || errorMessage.includes('different') || error.message?.includes('should be different')) {
          setPasswordError('הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית');
        } else if (errorMessage.includes('session') || errorMessage.includes('not authenticated')) {
          setPasswordError('פג תוקף החיבור. אנא בקשו קישור חדש.');
        } else {
          setPasswordError('שגיאה - אנא בקשו לינק חדש בדף ההתחברות');
        }
        return;
      }

      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setPasswordError('שגיאה - אנא בקשו לינק חדש בדף ההתחברות');
    } finally {
      setLoading(false);
    }
  };

  // LOADING STATE
  if (checkingSession) {
    return (
      <div className={`mobile-container ${styles.resetContainer}`}>
        <div className={styles.content}>
          <div className="text-section-title" style={{ textAlign: "center", color: "var(--color-text-primary)" }}>
            טוען...
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (sessionError) {
    return (
      <div className={`mobile-container ${styles.resetContainer}`}>
        <div className={styles.content}>
          <div className="section gap-sm" style={{ textAlign: "center" }}>
             <p className="text-subtitle" style={{ color: "var(--color-text-primary)" }}>{sessionError}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className={styles.primaryButton}
          >
            חזרה לדף ההתחברות
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  if (success) {
    return (
      <div className={`mobile-container ${styles.resetContainer}`}>
        <div className={styles.content}>
          <div className="section gap-sm" style={{ textAlign: "center" }}>
            <h1 className="header-primary" style={{ color: "var(--color-text-secondary)" }}>סיסמה שונתה בהצלחה!</h1>
            <p className="text-subtitle" style={{ color: "var(--color-text-primary)" }}>מעביר אותך לדף ההתחברות...</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FORM STATE
  return (
    <div className={`mobile-container ${styles.resetContainer}`}>
      <div className={styles.content}>
        
        {/* Header Section */}
        <div className="section gap-sm" style={{ textAlign: "center" }}>
          <h1 className="header-primary" style={{ color: "var(--color-text-secondary)" }}>שינוי סיסמה</h1>
          <p className="text-subtitle" style={{ color: "var(--color-text-primary)" }}>
            הכנס את סיסמה החדשה על מנת לקבל שוב גישה למערכת.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          {/* Password Input */}
          <div className={styles.inputWrapper}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
                setConfirmPasswordError('');
              }}
              required
              className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
              dir="rtl"
              placeholder="6 תווים או יותר"
            />
            <span className={styles.inputLabel}>סיסמה חדשה</span>
            {passwordError && (
              <span className={styles.fieldError}>{passwordError}</span>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className={styles.inputWrapper}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError('');
              }}
              required
              className={`${styles.input} ${confirmPasswordError ? styles.inputError : ''}`}
              dir="rtl"
              placeholder="6 תווים או יותר"
            />
            <span className={styles.inputLabel}>הזן שוב סיסמה חדשה</span>
            {confirmPasswordError && (
              <span className={styles.fieldError}>{confirmPasswordError}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.primaryButton}
          >
            {loading ? 'משנה...' : 'שינוי סיסמה'}
          </button>
        </form>
      </div>
    </div>
  );
}