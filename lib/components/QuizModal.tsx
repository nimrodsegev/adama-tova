/**
 * QUIZ MODAL – USED FOR GOOGLE SIGN-IN
 * This is IDENTICAL to the "צור משתמש" quiz UI
 * Uses the SAME JSX and SAME CSS module
 */

'use client';

import { useState } from 'react';
import { userService } from '@/app/services/userService';
import { useRouter } from 'next/navigation';
import styles from '@/app/login/page.module.css';

interface QuizModalProps {
  userId: string;
  userEmail: string;
}

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

export default function QuizModal({ userId, userEmail }: QuizModalProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [circle, setCircle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (!fullName || !phone) {
        throw new Error('שם מלא ומספר טלפון הם שדות חובה');
      }
  
      if (!isHebrewName(fullName)) {
        throw new Error('השם חייב להכיל אותיות עבריות בלבד');
      }
  
      if (!isValidPhone(phone)) {
        throw new Error('מספר הטלפון חייב להכיל 10 ספרות');
      }
  
      const cleanPhone = phone.replace(/[-\s]/g, '');
  
      await userService.completeProfile(userId, userEmail, {
        full_name: fullName.trim(),
        phone: cleanPhone,
        circle: circle || undefined,
        interests: interests.length ? interests : undefined,
        free_text: freeText || undefined,
      });
  
      // 🔥 NEW: Participants always go to pending approval
      router.replace('/pending-approval');
    } catch (err: any) {
      setError(err.message || 'שגיאה כללית');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.signupContent}>
        <h1 className={styles.title}>הרשמה</h1>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>פרטים אישיים</h3>

          <input
            className={styles.input}
            placeholder="שם מלא"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            dir="rtl"
          />

          <input
            className={styles.input}
            placeholder="מספר טלפון"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            dir="rtl"
          />

          <select
            className={styles.select}
            value={circle}
            onChange={e => setCircle(e.target.value)}
            dir="rtl"
          >
            <option value="">מאיזה מעגל אתה? (לא חובה)</option>
            {CIRCLE_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className={styles.interestsSection}>
            <label className={styles.label}>מה מעניין אותך? (לא חובה)</label>
            <div className={styles.interestsList}>
              {INTEREST_OPTIONS.map(i => (
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
            className={styles.textarea}
            placeholder="טקסט חופשי (לא חובה)"
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
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
      </form>
    </div>
  );
}
