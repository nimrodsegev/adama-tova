/**
 * ROLE SELECTION MODAL
 * Appears after Google sign-in for new users.
 * Asks if they're signing up as admin or participant.
 * Redirects to appropriate quiz based on selection.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RoleSelectionModal() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleParticipantChoice = () => {
    setIsRedirecting(true);
    router.push('/complete-profile');
  };

  const handleAdminChoice = () => {
    setIsRedirecting(true);
    router.push('/complete-profile-admin');
  };

  if (isRedirecting) {
    return null; // Hide modal during redirect
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        direction: 'rtl',
        textAlign: 'center',
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>ברוכים הבאים!</h2>
        <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>
          אנא בחר את סוג המשתמש שלך
        </p>

        <button
          onClick={handleParticipantChoice}
          disabled={isRedirecting}
          style={{
            width: '100%',
            padding: '1.2rem',
            marginBottom: '1rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            cursor: isRedirecting ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          אני משתתף
        </button>

        <button
          onClick={handleAdminChoice}
          disabled={isRedirecting}
          style={{
            width: '100%',
            padding: '1.2rem',
            background: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            cursor: isRedirecting ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          אני מנהל
        </button>
      </div>
    </div>
  );
}