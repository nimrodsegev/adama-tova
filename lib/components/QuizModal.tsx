/**
 * QUIZ MODAL
 * A modal form that appears after signup.
 * Collects: full name, phone, circle/community (dropdown), interests (checkboxes), free text
 * Validates: Hebrew name, 10-digit phone number
 * User cannot close this - must complete to use the app.
 */

'use client';

import { useState } from 'react';
import { userService } from '@/app/services/userService';
import { useRouter } from 'next/navigation';

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
  'מעגל שני ושלישי של משפחות השכול (סבים וסבתות דודים.ות, אחיינים.ות, בני דודים וכד\')',
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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [circle, setCircle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Validate Hebrew characters (includes spaces)
  const isHebrewName = (name: string) => {
    const hebrewRegex = /^[\u0590-\u05FF\s]+$/;
    return hebrewRegex.test(name);
  };

  // Validate 10-digit phone number
  const isValidPhone = (phoneNum: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNum.replace(/[-\s]/g, '')); // Remove dashes and spaces
  };

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fullName.trim() || !phone.trim()) {
      setError('שם מלא ומספר טלפון הם שדות חובה');
      return;
    }

    if (!isHebrewName(fullName.trim())) {
      setError('השם חייב להכיל אותיות עבריות בלבד');
      return;
    }

    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!isValidPhone(cleanPhone)) {
      setError('מספר הטלפון חייב להכיל 10 ספרות');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await userService.completeProfile(userId, {
        full_name: fullName.trim(),
        phone: cleanPhone,
        circle: circle || undefined,
        interests: interests.length > 0 ? interests : undefined,
        free_text: freeText.trim() || undefined,
      });

      router.refresh();
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'שגיאה בשמירת הפרטים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        direction: 'rtl',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>השלמת פרטים אישיים</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          ברוך הבא {userEmail}! בבקשה השלם את הפרטים הבאים
        </p>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              שם מלא *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="שם פרטי ושם משפחה"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              מספר טלפון *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="0501234567"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Circle/Community - Dropdown */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              מאיזה מעגל אתה? (לא חובה)
            </label>
            <select
              value={circle}
              onChange={(e) => setCircle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            >
              <option value="">בחר מעגל</option>
              {CIRCLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              מה מעניין אותך? (לא חובה)
            </label>
            <div style={{
              maxHeight: '150px',
              overflow: 'auto',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '0.5rem',
            }}>
              {INTEREST_OPTIONS.map((interest) => (
                <label
                  key={interest}
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    style={{ marginLeft: '0.5rem' }}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          {/* Free Text */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              טקסט חופשי (כל מה שאתם רוצים לשתף) - לא חובה
            </label>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="ספרו לנו קצת על עצמכם..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'שומר...' : 'המשך'}
          </button>
        </form>
      </div>
    </div>
  );
}