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

  // Success state - Email sent
  if (sent) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.title}>מייל נשלח!</h2>
            <div className={styles.messageContainer}>
              <p className={styles.message}>שלחנו מייל עם קישור לשינוי הסיסמה.</p>
              <p className={styles.message}>בדוק את תיבת הדואר שלך</p>
            </div>
            <div className={styles.buttons}>
              <button onClick={onClose} className={styles.primaryButton}>
                סגור
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - Confirmation
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2 className={styles.title}>שכחת סיסמה?</h2>
          <div className={styles.messageContainer}>
            <p className={styles.message}>
              לשינוי הסיסמה ישלח מייל לכתובת {email}
            </p>
            <p className={styles.recommendation}>
              מומלץ לבצע את הפעולה במחשב או דרך דפדפן בסמארטפון
            </p>
          </div>
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
    </div>
  );
}