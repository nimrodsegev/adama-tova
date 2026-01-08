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
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [success, setSuccess] = useState(false);

  // NO useEffect - let the session exist for password update

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

      if (error) throw error;

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
            {loading ? '...משנה' : 'שינוי סיסמה'}
          </button>
        </form>
      </div>
    </div>
  );
}