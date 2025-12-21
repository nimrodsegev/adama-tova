/**
 * LOGIN PAGE
 * Two-step process:
 * Step 1: Choose action (login, signup participant, signup admin, Google)
 * Step 2: Enter credentials (email/password) based on choice
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/services/authService';
import styles from "./page.module.css";
import GoogleLoginButton from "./GoogleLoginButton";

type LoginMode = 'choice' | 'login' | 'signup-participant' | 'signup-admin';

export default function Login() {
  const [mode, setMode] = useState<LoginMode>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validate password requirements
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
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        // Login
        await authService.signIn(email, password);
        router.refresh();
        router.replace('/');
      } else {
        // Signup (participant or admin)
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        await authService.signUp(email, password);
        
        if (mode === 'signup-admin') {
          router.push('/complete-profile-admin');
        } else {
          router.push('/complete-profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Could not authenticate user');
    } finally {
      setLoading(false);
    }
  };

  const resetToChoice = () => {
    setMode('choice');
    setEmail('');
    setPassword('');
    setError('');
  };

  // Step 1: Choice Screen
  if (mode === 'choice') {
    return (
      <div className="content">
        <div className={styles.loginForm} style={{ direction: 'rtl' }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>ברוכים הבאים לאדמה טובה</h2>
          
          <button 
            onClick={() => setMode('login')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              marginBottom: '1rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            התחבר
          </button>

          <button 
            onClick={() => setMode('signup-participant')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              marginBottom: '1rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            הירשם כמשתתף
          </button>

          <button 
            onClick={() => setMode('signup-admin')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              marginBottom: '1.5rem',
              background: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            הירשם כמנהל
          </button>

          <div style={{ borderTop: '1px solid #ccc', paddingTop: '1rem', marginTop: '1rem' }}>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Email/Password Form
  const getTitleText = () => {
    if (mode === 'login') return 'התחברות';
    if (mode === 'signup-admin') return 'הרשמה כמנהל';
    return 'הרשמה כמשתתף';
  };

  const getButtonText = () => {
    if (mode === 'login') return 'התחבר';
    if (mode === 'signup-admin') return 'הירשם כמנהל';
    return 'הירשם כמשתתף';
  };

  return (
    <div className="content">
      <form className={styles.loginForm} onSubmit={handleSubmit} style={{ direction: 'rtl' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{getTitleText()}</h2>

        <label htmlFor="email">
          אימייל{' '}
          <input
            name="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ direction: 'ltr' }}
          />
        </label>

        <label htmlFor="password">
          סיסמה{' '}
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            autoComplete="on"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'טוען...' : getButtonText()}
        </button>

        <button 
          type="button" 
          onClick={resetToChoice}
          style={{ 
            marginTop: '0.5rem',
            background: '#6c757d',
            color: 'white'
          }}
        >
          חזור
        </button>

        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
}