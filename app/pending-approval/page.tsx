'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

  // Poll for approval status changes
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('users')
          .select('is_approved, role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.is_approved) {
          // User has been approved - redirect to home
          if (profile.role === 'admin') {
            router.replace('/AdminScreens/HomePage');
          } else {
            router.replace('/UserScreens/HomePage');
          }
        }
      } catch (error) {
        // Silently ignore errors - will retry on next poll
      }
    };

    // Check immediately on mount
    checkApprovalStatus();

    // Then check every 5 seconds
    const interval = setInterval(checkApprovalStatus, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Concentric circles animation */}
        <div className={styles.circles}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
          <div className={styles.circle4}></div>
          <div className={styles.circle5}></div>
          <div className={styles.circle6}></div>
          <div className={styles.circle7}></div>
          <div className={styles.circle8}></div>
          <div className={styles.circle9}></div>
          <div className={styles.circle10}></div>
        </div>

        {/* Main message */}
        <div className={styles.messageBox}>
          <p className={styles.mainText}>
            <span>כמעט שם...</span>
            <span>הפרטים שלך בבדיקה,</span>
            <span>נעדכן כשהגישה תיפתח.</span>
          </p>
        </div>

        {/* Contact info */}
        <p className={styles.contactText}>
          [לסיוע ויצירת קשר: [להשלים כתובת מייל
        </p>

        {/* Back to registration button */}
        <button
          onClick={handleBackToLogin}
          className={styles.backButton}
        >
          לעמוד ההרשמה
          <span className={styles.backButtonArrow}></span>
        </button>
      </div>
    </div>
  );
}