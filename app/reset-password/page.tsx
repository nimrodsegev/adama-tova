'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [success, setSuccess] = useState(false);

  // NO useEffect - let the session exist for password update

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError('סיסמה חלשה');
      setConfirmPasswordError('סיסמה חלשה');
      setError(passwordValidation);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('הסיסמאות אינן תואמות');
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      await supabase.auth.signOut();

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'שגיאה בשינוי הסיסמה');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.greeting}>
            <h1 className={styles.title}>סיסמה שונתה בהצלחה!</h1>
            <p className={styles.subtitle}>מעביר אותך לדף ההתחברות...</p>
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
            />
            <span className={styles.inputLabel}>הזן שוב סיסמה חדשה</span>
            {confirmPasswordError && (
              <span className={styles.fieldError}>{confirmPasswordError}</span>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

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