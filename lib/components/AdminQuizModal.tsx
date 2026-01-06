/**
 * ADMIN QUIZ MODAL FOR GOOGLE SIGN-IN
 * Same format as signup page but without email/password fields
 * Appears after Google user selects "admin" role
 */

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminQuizModalProps {
  userId: string;
  userEmail: string;
}

export default function AdminQuizModal({
  userId,
  userEmail,
}: AdminQuizModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isHebrewName = (name: string) => {
    const hebrewRegex = /^[\u0590-\u05FF\s]+$/;
    return hebrewRegex.test(name);
  };

  const isValidPhone = (phoneNum: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNum.replace(/[-\s]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim()) {
      setError("שם מלא ומספר טלפון הם שדות חובה");
      return;
    }

    if (!isHebrewName(fullName.trim())) {
      setError("השם חייב להכיל אותיות עבריות בלבד");
      return;
    }

    const cleanPhone = phone.replace(/[-\s]/g, "");
    if (!isValidPhone(cleanPhone)) {
      setError("מספר הטלפון חייב להכיל 10 ספרות");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: dbError } = await supabase.from("users").upsert({
        id: userId,
        email: userEmail,
        role: "admin",
        full_name: fullName.trim(),
        phone: cleanPhone,
        notifications_enabled: true,
        quiz: {
          completed_at: new Date().toISOString(),
        },
      });

      if (dbError) throw dbError;

      router.refresh();
      router.replace("/AdminScreens");
    } catch (err: any) {
      setError(err.message || "שגיאה בשמירת הפרטים");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "auto",
        padding: "2rem 0",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
          direction: "rtl",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          הרשמה כמנהל
        </h2>
        <p style={{ marginBottom: "2rem", color: "#666", textAlign: "center" }}>
          שלום {userEmail}! אנא מלא את הפרטים הבאים
        </p>

        {/* Full Name */}
        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            שם מלא *
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="שם פרטי ושם משפחה"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </label>

        {/* Phone */}
        <label style={{ display: "block", marginBottom: "1.5rem" }}>
          <span
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            מספר טלפון *
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="0501234567"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </label>

        {error && (
          <p
            style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#ffc107",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {loading ? "שומר..." : "המשך כמנהל"}
        </button>
      </form>
    </div>
  );
}
