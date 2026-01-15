"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Popup from "@/lib/components/UI/Popup";

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
      <Popup
        title="מייל נשלח!"
        content="שלחנו מייל עם קישור לשינוי הסיסמה. בדוק את תיבת הדואר שלך"
        secondaryButtonText="סגור"
        secondaryButtonAction={onClose}
        onClose={onClose}
      />
    );
  }

  // Initial state - Confirmation
  return (
    <Popup
      title="שכחת סיסמה?"
      content={`לשינוי הסיסמה ישלח מייל לכתובת ${email}`}
      recommendation="מומלץ לבצע את הפעולה במחשב או דרך דפדפן בסמארטפון"
      primaryButtonText="כן, שלח מייל"
      primaryButtonAction={handleSendEmail}
      loading={loading}
      secondaryButtonText="ביטול"
      secondaryButtonAction={onClose}
      onClose={onClose}
    />
  );
}