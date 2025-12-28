'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

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
            כמעט שם... הפרטים שלך בבדיקה, נעדכן כשהגישה תיפתח
          </p>
        </div>

        {/* Contact info */}
        <p className={styles.contactText}>
          [לסיוע ויצירת קשר: [להשלים כתובת מייל
        </p>

        {/* Logout button */}
        <button
          onClick={handleBackToLogin}
          className={styles.backButton}
        >
          חזור לדף התחברות
        </button>
      </div>
    </div>
  );
}