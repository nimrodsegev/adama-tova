'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/services/authService';
import { userService } from '@/app/services/userService';
import GoogleLoginButton from './GoogleLoginButton';
import styles from './page.module.css';

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

  // Quiz fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [circle, setCircle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  // Validation functions
  const isHebrewName = (name: string) => /^[\u0590-\u05FF\s]+$/.test(name);
  const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p.replace(/[-\s]/g, ''));

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


  const toggleInterest = (i: string) => {
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('אנא מלא אימייל וסיסמה');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.signIn(email, password);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'שגיאה בהתחברות');
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

      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
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

      router.refresh();
      router.replace('/UserScreens');
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
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                dir="rtl"
              />
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                dir="rtl"
              />
              <button
                className={styles.forgotPassword}
                onClick={() => console.log('Forgot password')}
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
                onClick={() => setMode('signup')}
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

            {error && (
              <p className={styles.error}>{error}</p>
            )}
          </div>
        </div>
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