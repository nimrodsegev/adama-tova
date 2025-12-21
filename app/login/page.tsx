'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/services/authService';
import { userService } from '@/app/services/userService';
import GoogleLoginButton from './GoogleLoginButton';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/client';


type Mode =
  | 'choice'
  | 'login'
  | 'signup-participant'
  | 'signup-admin';

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

  // auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // quiz (shared)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // participant-only
  const [circle, setCircle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  const isHebrewName = (name: string) =>
    /^[\u0590-\u05FF\s]+$/.test(name);

  const isValidPhone = (p: string) =>
    /^[0-9]{10}$/.test(p.replace(/[-\s]/g, ''));

  const toggleInterest = (i: string) => {
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      if (!email || !password) {
        throw new Error('אימייל וסיסמה הם שדות חובה');
      }
  
      if (!fullName || !phone) {
        throw new Error('שם מלא ומספר טלפון הם שדות חובה');
      }
  
      if (!isHebrewName(fullName)) {
        throw new Error('השם חייב להכיל אותיות עבריות בלבד');
      }
  
      if (!isValidPhone(phone)) {
        throw new Error('מספר הטלפון חייב להכיל 10 ספרות');
      }
  
      // 1️⃣ Sign up
      const { user } = await authService.signUp(email, password);
      if (!user) throw new Error('שגיאה בהרשמה');
  
      const cleanPhone = phone.replace(/[-\s]/g, '');
  
      // 2️⃣ Save profile
      if (mode === 'signup-admin') {
        // SAME logic as AdminQuizModal
        const supabase = createClient();
        const { error: dbError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email,
            role: 'admin',
            full_name: fullName.trim(),
            phone: cleanPhone,
            notifications_enabled: true,
            quiz: {
              completed_at: new Date().toISOString(),
            },
          });
  
        if (dbError) throw dbError;
        router.replace('/adminScreens');
      } else {
        // SAME logic as QuizModal
        await userService.completeProfile(user.id, email, {
          full_name: fullName.trim(),
          phone: cleanPhone,
          circle: circle || undefined,
          interests: interests.length ? interests : undefined,
          free_text: freeText || undefined,
        });
  
        router.replace('/UserScreens');
      }
  
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'שגיאה כללית');
    } finally {
      setLoading(false);
    }
  };
  

  // ======================
  // CHOICE SCREEN
  // ======================
  if (mode === 'choice') {
    return (
      <div className="content" style={{ direction: 'rtl' }}>
        <div className={styles.loginForm}>
          <h2>ברוכים הבאים לאדמה טובה</h2>

          <button onClick={() => setMode('login')}>
            התחבר
          </button>

          <button
            style={{ background: '#28a745', color: 'white' }}
            onClick={() => setMode('signup-participant')}
          >
            הירשם כמשתתף
          </button>

          <button
            style={{ background: '#ffc107' }}
            onClick={() => setMode('signup-admin')}
          >
            הירשם כמנהל
          </button>

          <hr />
          <GoogleLoginButton />
        </div>
      </div>
    );
  }

  // ======================
  // LOGIN ONLY
  // ======================
  if (mode === 'login') {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          await authService.signIn(email, password);
          router.replace('/');
        }}
        className={styles.loginForm}
        style={{ direction: 'rtl' }}
      >
        <h2>התחברות</h2>

        <input
          placeholder="אימייל"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button disabled={loading}>התחבר</button>
        <button type="button" onClick={() => setMode('choice')}>
          חזור
        </button>
      </form>
    );
  }

  // ======================
  // SIGNUP + QUIZ (ADMIN / PARTICIPANT)
  // ======================
  return (
    <form
      onSubmit={handleSubmit}
      className={styles.loginForm}
      style={{ direction: 'rtl' }}
    >
      <h2>
        {mode === 'signup-admin'
          ? 'הרשמה כמנהל'
          : 'הרשמה כמשתתף'}
      </h2>

      <input
        placeholder="אימייל"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="סיסמה"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <hr />

      <input
        placeholder="שם מלא"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />

      <input
        placeholder="טלפון"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      {mode === 'signup-participant' && (
        <>
          <select
            value={circle}
            onChange={e => setCircle(e.target.value)}
          >
            <option value="">בחר מעגל</option>
            {CIRCLE_OPTIONS.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <div style={{ marginTop: '1rem', width: '100%' }}>
  {INTEREST_OPTIONS.map(i => (
    <label
      key={i}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        justifyContent: 'end',
        alignItems: 'center',
        columnGap: '0.5rem',
        direction: 'rtl',
        marginBottom: '0.75rem',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <input
        type="checkbox"
        checked={interests.includes(i)}
        onChange={() => toggleInterest(i)}
      />
      <span>{i}</span>
    </label>
  ))}
</div>


          <textarea
            placeholder="טקסט חופשי"
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
          />
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button disabled={loading}>
        {loading ? 'שומר...' : 'הרשם'}
      </button>

      <button type="button" onClick={() => setMode('choice')}>
        חזור
      </button>
    </form>
  );
}
