/**
 * LOGIN PAGE
 * Handles email/password login and signup, plus Google OAuth.
 * After signup, redirects to /complete-profile for quiz.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/services/authService';
import styles from "./page.module.css";
import GoogleLoginButton from "./GoogleLoginButton";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.signIn(email, password);
      router.refresh(); // Force immediate refresh
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Could not authenticate user');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.signUp(email, password);
      // Redirect to quiz page to complete profile
      router.push('/complete-profile');
    } catch (err: any) {
      setError(err.message || 'Could not authenticate user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <form className={styles.loginForm} onSubmit={handleSignIn}>
        <label htmlFor="email">
          Email{' '}
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label htmlFor="password">
          Password{' '}
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

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Log In'}
        </button>
        <button type="button" onClick={handleSignUp} disabled={loading}>
          Sign Up
        </button>

        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <GoogleLoginButton />
      </form>
    </div>
  );
}