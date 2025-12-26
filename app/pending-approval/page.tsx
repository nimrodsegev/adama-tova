'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.messageBox}>
          <h1 className={styles.title}>הרשמתך התקבלה!</h1>
          
          <div className={styles.message}>
            <p className={styles.mainText}>
              תודה על ההרשמה למערכת אדמה טובה.
            </p>
            <p className={styles.subText}>
              הרשמתך ממתינה לאישור מנהל המערכת.
              <br />
              תקבל הודעה למייל ברגע שהחשבון שלך יאושר.
            </p>
          </div>

          <button
            onClick={() => router.push('/login')}
            className={styles.backButton}
          >
            חזור לדף התחברות
          </button>
        </div>
      </div>
    </div>
  );
}