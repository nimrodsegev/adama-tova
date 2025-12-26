'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/services/authService';
import { userService } from '@/app/services/userService';
import GoogleLoginButton from './GoogleLoginButton';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/client';
import ForgotPasswordModal from '@/lib/components/ForgotPasswordModal';



type Mode = 'choice' | 'signup';

const CIRCLE_OPTIONS = [
  'שורדי ושורדות המסיבות',
  'נפגעי טראומה 7.10 ומלחמת חרבות ברזל',
  'הורים שכולים',
  'אחים.ות שכולים',
  'משפחות וקרובים של פצועים טראומה בגופם ובנפשם',
  'כוחות הצלה וחילוץ',
  'תושבי העוטף ומפונים',
  'מעגל שני ושלישי של משפחות השכול',
];

const INTEREST_OPTIONS = [
  'יוגה',
  'מדיטציה',
  'אומנות',
  'כתיבה',
  'יצירה',
  'מינדפולנס',
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Field-specific errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Quiz fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [circle, setCircle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  // Validation functions
  const isHebrewName = (name: string) => /^[\u0590-\u05FF\s]+$/.test(name);
  const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p.replace(/[-\s]/g, ''));
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'הסיסמה חייבת להכיל לפחות 8 תווים';
    }
    if (!/[A-Z]/.test(password)) {
      return 'הסיסמה חייבת להכיל לפחות אות גדולה אחת באנגלית';
    }
    if (!/[a-z]/.test(password)) {
      return 'הסיסמה חייבת להכיל לפחות אות קטנה אחת באנגלית';
    }
    if (!/[0-9]/.test(password)) {
      return 'הסיסמה חייבת להכיל לפחות ספרה אחת';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'אימייל הוא שדה חובה';
    }
    if (!emailRegex.test(email)) {
      return 'פורמט האימייל לא תקין';
    }
    return null;
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
      
      return !!data;
    } catch {
      return false;
    }
  };

  const toggleInterest = (i: string) => {
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setError('');
    
    if (!email || !password) {
      setError('אנא מלא אימייל וסיסמה');
      return;
    }
    
    setLoading(true);
    
    try {
      // First, check if user exists in our database
      const userExists = await checkUserExists(email);
      
      if (!userExists) {
        setEmailError('אימייל לא נמצא');
        setLoading(false);
        return;
      }
      
      // User exists in database - NOW try to authenticate
      try {
        await authService.signIn(email, password);
        
        // 🔥 NEW: Check if user is approved
        const user = await authService.getCurrentUser();
        if (user) {
          const supabase = createClient();
          const { data: profile } = await supabase
            .from('users')
            .select('is_approved, role')
            .eq('id', user.id)
            .single();
          
          if (profile && !profile.is_approved && profile.role === 'participant') {
            // User is not approved - redirect to pending page
            router.replace('/pending-approval');
            return;
          }
        }
        
        router.refresh();
      } catch (authError: any) {
        // Authentication failed - wrong password
        setPasswordError('סיסמה שגויה');
      }
    } catch (err: any) {
      setError('שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate email and password
      if (!email || !password) {
        throw new Error('אימייל וסיסמה הם שדות חובה');
      }

      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        throw new Error(passwordValidation);
      }

      // Validate quiz fields
      if (!fullName || !phone) {
        throw new Error('שם מלא ומספר טלפון הם שדות חובה');
      }

      if (!isHebrewName(fullName)) {
        throw new Error('השם חייב להכיל אותיות עבריות בלבד');
      }

      if (!isValidPhone(phone)) {
        throw new Error('מספר הטלפון חייב להכיל 10 ספרות');
      }

      // Sign up
      await authService.signUp(email, password);

      // Get the current user
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('שגיאה בהרשמה');

      const cleanPhone = phone.replace(/[-\s]/g, '');

      // Save profile
      await userService.completeProfile(user.id, email, {
        full_name: fullName.trim(),
        phone: cleanPhone,
        circle: circle || undefined,
        interests: interests.length ? interests : undefined,
        free_text: freeText || undefined,
      });

      router.replace('/pending-approval');
  } catch (err: any) {
    setError(err.message || 'שגיאה כללית');
  } finally {
    setLoading(false);
  }
  };

  // Welcome/Choice Screen
if (mode === 'choice') {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>ברוכה הבאה</h1>
          <p className={styles.subtitle}>להרשמה או התחברות הכניסו פרטים</p>
        </div>

        <div className={styles.loginContent}>
          {/* Email Input */}
          <div className={styles.inputWrapper}>
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              className={`${styles.input} ${emailError ? styles.inputError : ''}`}
              dir="rtl"
            />
            {emailError && (
              <span className={styles.fieldError}>{emailError}</span>
            )}
          </div>

          {/* Password Input */}
          <div className={styles.inputWrapper}>
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
              dir="rtl"
            />
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
              {loading ? 'מתחבר...' : 'התחבר'}
            </button>

            <button
              className={styles.secondaryButton}
              onClick={async () => {
                setEmailError('');
                setPasswordError('');
                setError('');

                const emailValidation = validateEmail(email);
                if (emailValidation) {
                  setEmailError('אימייל לא תקין');
                  setError(emailValidation);
                  return;
                }

                const passwordValidation = validatePassword(password);
                if (passwordValidation) {
                  setPasswordError('סיסמה חלשה');
                  setError(passwordValidation);
                  return;
                }

                setLoading(true);
                const userExists = await checkUserExists(email);
                setLoading(false);

                if (userExists) {
                  setEmailError('אימייל קיים במערכת');
                  setError('המשתמש כבר קיים במערכת. אנא התחבר');
                  return;
                }

                setMode('signup');
              }}
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

          {error && <p className={styles.error}>{error}</p>}
        </div>
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



  // Signup Form
  return (
    <div className={styles.container}>
      <form onSubmit={handleSignup} className={styles.signupContent}>
        <h1 className={styles.title}>הרשמה</h1>

        {/* Personal Details */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>פרטים אישיים</h3>

          <input
            type="text"
            placeholder="שם מלא"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={styles.input}
            dir="rtl"
          />

          <input
            type="tel"
            placeholder="מספר טלפון"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={styles.input}
            dir="rtl"
          />

          <select
            value={circle}
            onChange={(e) => setCircle(e.target.value)}
            className={styles.select}
            dir="rtl"
          >
            <option value="">מאיזה מעגל אתה? (לא חובה)</option>
            {CIRCLE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className={styles.interestsSection}>
            <label className={styles.label}>מה מעניין אותך? (לא חובה)</label>
            <div className={styles.interestsList}>
              {INTEREST_OPTIONS.map((i) => (
                <label key={i} className={styles.interestItem}>
                  <input
                    type="checkbox"
                    checked={interests.includes(i)}
                    onChange={() => toggleInterest(i)}
                    className={styles.checkbox}
                  />
                  <span>{i}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder="טקסט חופשי (לא חובה)"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={4}
            className={styles.textarea}
            dir="rtl"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={styles.primaryButton}
        >
          {loading ? 'נרשם...' : 'הרשם'}
        </button>

        <button
          type="button"
          onClick={() => setMode('choice')}
          className={styles.backButton}
        >
          חזור
        </button>
      </form>
    </div>
  );
}