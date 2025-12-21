/**
 * ADMIN QUIZ MODAL
 * Simple form for admin signup - only collects name and phone.
 * Sets role to 'admin' in database.
 * Redirects to /adminScreens after completion.
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AdminQuizModalProps {
  userId: string;
  userEmail: string;
}

export default function AdminQuizModal({ userId, userEmail }: AdminQuizModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Validate Hebrew characters
  const isHebrewName = (name: string) => {
    const hebrewRegex = /^[\u0590-\u05FF\s]+$/;
    return hebrewRegex.test(name);
  };

  // Validate 10-digit phone number
  const isValidPhone = (phoneNum: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNum.replace(/[-\s]/g, ''));
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
      const supabase = createClient();
      
      // Save admin profile
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userEmail,
          role: 'admin',  // Set as admin
          full_name: fullName.trim(),
          phone: cleanPhone,
          notifications_enabled: true,
          quiz: {
            completed_at: new Date().toISOString(),
          }
        });

      if (dbError) throw dbError;

      // Redirect to admin screens
      router.refresh();
      router.replace('/adminScreens');
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
        direction: 'rtl',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>הרשמה כמנהל</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          שלום {userEmail}! אנא מלא את הפרטים הבאים
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
          <div style={{ marginBottom: '1.5rem' }}>
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

          {error && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'שומר...' : 'המשך כמנהל'}
          </button>
        </form>
      </div>
    </div>
  );
}