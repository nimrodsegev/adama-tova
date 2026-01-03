/**
 * PROFILE PAGE
 * Displays complete user profile information from users table.
 * Shows: name, email, phone, role, circle, interests, free text.
 * Protected route - only accessible when logged in.
 */
"use client";
import ProtectedRoute from "@/lib/components/ProtectedRoute";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, userProfile, loading, signOut } = useUser();
  const { t } = useIvrita();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>טוען...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div
        className="content"
        style={{
          padding: "2rem",
          direction: "rtl",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>הפרופיל שלי</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#681F02",
              color: "white",
              border: "none",
              borderRadius: "1.5625rem",
              cursor: "pointer",
              fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
              fontSize: "0.875rem",
              fontWeight: "400",
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t('התנתק/י')}
          </button>
        </div>

        {/* Basic Info */}
        <div
          style={{
            marginTop: "2rem",
            background: "#f5f5f5",
            padding: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>פרטים אישיים</h2>
          <p>
            <strong>שם מלא:</strong> {userProfile?.full_name || "לא צוין"}
          </p>
          <p>
            <strong>אימייל:</strong> {userProfile?.email || user?.email}
          </p>
          <p>
            <strong>טלפון:</strong> {userProfile?.phone || "לא צוין"}
          </p>
          <p>
            <strong>תפקיד:</strong>{" "}
            {userProfile?.role === "admin" ? "מנהל" : "משתתף"}
          </p>
          <p>
            <strong>התראות:</strong>{" "}
            {userProfile?.notifications_enabled ? "מופעלות" : "כבויות"}
          </p>
        </div>

        {/* Quiz Info */}
        {userProfile?.quiz && (
          <div
            style={{
              marginTop: "2rem",
              background: "#e8f4f8",
              padding: "1.5rem",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>פרטי שאלון</h2>

            {userProfile.quiz.circle && (
              <p>
                <strong>מעגל:</strong> {userProfile.quiz.circle}
              </p>
            )}

            {userProfile.quiz.interests &&
              userProfile.quiz.interests.length > 0 && (
                <div>
                  <strong>תחומי עניין:</strong>
                  <ul style={{ marginTop: "0.5rem" }}>
                    {userProfile.quiz.interests.map((interest, i) => (
                      <li key={i}>{interest}</li>
                    ))}
                  </ul>
                </div>
              )}

            {userProfile.quiz.free_text && (
              <div style={{ marginTop: "1rem" }}>
                <strong>טקסט חופשי:</strong>
                <p
                  style={{
                    marginTop: "0.5rem",
                    padding: "1rem",
                    background: "white",
                    borderRadius: "4px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {userProfile.quiz.free_text}
                </p>
              </div>
            )}

            {userProfile.quiz.completed_at && (
              <p
                style={{ fontSize: "0.9rem", color: "#666", marginTop: "1rem" }}
              >
                <strong>השאלון הושלם ב:</strong>{" "}
                {new Date(userProfile.quiz.completed_at).toLocaleDateString(
                  "he-IL"
                )}
              </p>
            )}
          </div>
        )}

        {/* Admin Badge */}
        {userProfile?.role === "admin" && (
          <div
            style={{
              marginTop: "2rem",
              background: "#fff3cd",
              border: "2px solid #ffc107",
              padding: "1rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              🔑 יש לך הרשאות מנהל
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
