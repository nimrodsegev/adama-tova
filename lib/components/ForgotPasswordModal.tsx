"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./ForgotPasswordModal.module.css";

interface ForgotPasswordModalProps {
  email: string;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  email,
  onClose,
}: ForgotPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendEmail = async () => {
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) throw error;
      setSent(true);
    } catch (err) {
      console.error("Error sending reset email:", err);
      alert("שגיאה בשליחת המייל");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h2 className={styles.title}>מייל נשלח!</h2>
          <p className={styles.message}>
            שלחנו לך מייל עם קישור לשינוי הסיסמה. בדוק את תיבת הדואר שלך.
          </p>
          <button onClick={onClose} className={styles.primaryButton}>
            סגור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>שכחת סיסמה?</h2>
        <p className={styles.message}>
          אתה בטוח? תקבל מייל עם לינק לשינוי הסיסמה
        </p>
        <p className={styles.email}>{email}</p>
        
        <p className={styles.recommendation}>
          מומלץ לבצע את הפעולה במחשב או דרך דפדפן בסמארטפון (שאינו בגלישה פרטית)
        </p>

        <div className={styles.buttons}>
          <button
            onClick={handleSendEmail}
            disabled={loading}
            className={styles.primaryButton}
          >
            {loading ? "שולח..." : "כן, שלח מייל"}
          </button>
          <button onClick={onClose} className={styles.secondaryButton}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}