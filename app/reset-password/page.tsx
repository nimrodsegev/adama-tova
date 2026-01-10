'use client';

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
        // No valid session - show error
        if (exchangeError) {
          // Code exchange failed - likely opened on different device or private browsing
          setSessionError('הקישור לא תקף. יש לפתוח את הקישור מאותו מכשיר בו ביקשת לאפס את הסיסמה, ולוודא שאינך בגלישה פרטית.');
        } else if (code || accessToken) {
          // Had tokens but still no session - expired or invalid
          setSessionError('הקישור פג תוקף. אנא בקשו קישור חדש.');
        } else {
          // No tokens at all - direct navigation to page
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
        // Check for specific error types
        const errorMessage = error.message?.toLowerCase() || '';

        if (errorMessage.includes('same') || errorMessage.includes('different') ||
            error.message?.includes('should be different')) {
          // Same password error
          setPasswordError('הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית');
        } else if (errorMessage.includes('session') || errorMessage.includes('not authenticated')) {
          // Session expired
          setPasswordError('פג תוקף החיבור. אנא בקשו קישור חדש.');
        } else {
          // Generic error
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

  // Loading state while checking session
  if (checkingSession) {
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
            dir="rtl"
          >
            טוען...
          </div>
        </div>
      </div>
    );
  }

  // Session error - show message with button to go back to login
  if (sessionError) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.greeting}>
            <p className={styles.subtitle}>{sessionError}</p>
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

  if (success) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.greeting}>
              <h1 className={styles.title}>סיסמה שונתה בהצלחה!</h1>
              <p className={styles.subtitle}>מעביר אותך לדף ההתחברות...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>שינוי סיסמה</h1>
          <p className={styles.subtitle}>
            הכנס את סיסמה החדשה על מנת לקבל שוב גישה למערכת.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginContent}>
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
