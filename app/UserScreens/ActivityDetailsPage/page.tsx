"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { apiActivities, apiRegistrations } from "@/app/services/db_api";

export default function ActivityDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");

  // Get user info from context
  const { user, userProfile, loading: userLoading } = useUser();
  const { t } = useIvrita();

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // STATUS: 'none' | 'confirmed' | 'waitlist'
  const [regStatus, setRegStatus] = useState<'none' | 'confirmed' | 'waitlist'>('none');

  useEffect(() => {
    if (activityId) {
      loadActivity();
      if (user) {
        checkRegistrationStatus();
      }
    }
  }, [activityId, user]);

  const loadActivity = async () => {
    try {
      const [data, error] = await apiActivities.getById(activityId!);
      if (error) {
        console.error("Error loading activity:", error);
        alert("שגיאה בטעינת הפעילות");
      } else {
        setActivity(data);
      }
    } catch (error) {
      console.error("Error loading activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user || !activityId) return;
    try {
      const [status, error] = await apiRegistrations.getRegistrationStatus(user.id, activityId);
      if (!error && status) {
        setRegStatus(status as 'none' | 'confirmed' | 'waitlist');
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const isAdmin = userProfile?.role === "admin";

  // ADMIN FUNCTIONS
  const handleEdit = () => {
    router.push(`/adminScreens/EditActivityPage?id=${activityId}`);
  };

  const handleDelete = async () => {
    if (!confirm(t("האם את/ה בטוח/ה שברצונך למחוק פעילות זו?"))) return;

    setProcessing(true);
    const [_, error] = await apiActivities.delete(activityId!);

    if (error) {
      alert("שגיאה במחיקה: " + error);
      setProcessing(false);
    } else {
      alert("הפעילות נמחקה בהצלחה");
      router.back();
    }
  };

  // USER FUNCTIONS
  const handleToggleRegistration = async () => {
    if (!user) return alert("עליך להתחבר כדי להירשם.");

    setProcessing(true);

    if (regStatus !== 'none') {
      // ❌ LEAVE
      const [_, error] = await apiRegistrations.cancelRegistration(user.id, activityId!);
      if (error) {
        alert("שגיאה בביטול: " + error);
      } else {
        setRegStatus('none');
        alert("ההרשמה בוטלה בהצלחה");
        await loadActivity();
      }
    } else {
      // ✅ JOIN
      const [res, error] = await apiRegistrations.registerUserToActivity(user.id, activityId!);
      if (error) {
        alert("שגיאה בהרשמה: " + error);
      } else {
        const isWaitlist = res?.message?.includes("waitlist");
        setRegStatus(isWaitlist ? 'waitlist' : 'confirmed');
        if (res?.message) alert(res.message);
        await loadActivity();
      }
    }
    setProcessing(false);
  };

  if (loading || userLoading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  if (!activity) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Activity not found</div>;
  }

  const spotsLeft = activity.max_participants - (activity.current_participants || 0);
  const isFull = spotsLeft <= 0;

  // Button Logic
  let buttonText = "✓ הירשם/י לפעילות";
  let buttonColor = "#10b981"; // Green

  if (regStatus === 'confirmed') {
    buttonText = "❌ בטל/י הרשמה";
    buttonColor = "#ef4444"; // Red
  } else if (regStatus === 'waitlist') {
    buttonText = "⏳ צא/י מרשימת המתנה";
    buttonColor = "#f97316"; // Orange
  } else if (isFull) {
    buttonText = "➕ הכנס/י לרשימת המתנה";
    buttonColor = "#f59e0b"; // Yellow/Orange
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "24px",
        direction: "rtl",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: "24px",
            color: "#3b82f6",
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ← חזור
        </button>

        {/* Main Card */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* 👇 1. NEW: IMAGE BANNER (Only if image_url exists) */}
          {activity.image_url && (
            <div style={{ width: "100%", height: "300px", overflow: "hidden" }}>
              <img 
                src={activity.image_url} 
                alt={activity.title} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Header */}
          <div
            style={{
              background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
              padding: "32px",
              color: "white",
            }}
          >
            <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "8px" }}>
              {activity.title}
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.9 }}>
              תיאור: {activity.description}
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: "32px" }}>
            {/* Quick Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              <InfoBox icon="📅" label="תאריך" value={new Date(activity.date).toLocaleDateString("he-IL")} />
              <InfoBox icon="🕐" label="שעת התחלה" value={activity.start_time.slice(0, 5)} />
              <InfoBox icon="🕐" label="שעת סיום" value={activity.end_time.slice(0, 5)} />
              <InfoBox icon="📍" label="מיקום" value={activity.location} />
              <InfoBox icon="👥" label="משתתפים" value={`${activity.current_participants || 0}/${activity.max_participants}`} />
              {activity.instructor && <InfoBox icon="👤" label="מדריך/ה" value={activity.instructor} />}
            </div>

            {/* Participants Status Bar */}
            <div style={{ backgroundColor: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "8px", padding: "16px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#666" }}>זמינות</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {isFull ? "הפעילות מלאה" : `נותרו ${spotsLeft} מקומות`}
                  </div>
                </div>
                <div>
                  {isFull ? (
                    <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "8px 16px", borderRadius: "20px", fontWeight: "600" }}>
                      מלא (רשימת המתנה)
                    </span>
                  ) : (
                    <span style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "8px 16px", borderRadius: "20px", fontWeight: "600" }}>
                      פתוח להרשמה
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {isAdmin ? (
              <div style={{ display: "flex", gap: "16px" }}>
                <button onClick={handleEdit} disabled={processing} style={{ flex: 1, padding: "16px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", opacity: processing ? 0.7 : 1 }}>
                  ✏️ ערוך פעילות
                </button>
                <button onClick={handleDelete} disabled={processing} style={{ flex: 1, padding: "16px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", opacity: processing ? 0.7 : 1 }}>
                  {processing ? "מוחק..." : "🗑️ מחק פעילות"}
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleToggleRegistration}
                  disabled={processing}
                  style={{
                    width: "100%",
                    padding: "16px",
                    backgroundColor: buttonColor,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: processing ? "not-allowed" : "pointer",
                    opacity: processing ? 0.7 : 1,
                  }}
                >
                  {processing ? "מעדכן..." : t(buttonText)}
                </button>

                {regStatus === 'confirmed' && (
                  <div style={{ marginTop: "16px", backgroundColor: "#d1fae5", border: "1px solid #10b981", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <p style={{ color: "#065f46", fontWeight: "600", margin: 0 }}>{t('✓ את/ה רשום/ה לפעילות זו')}</p>
                  </div>
                )}
                
                {regStatus === 'waitlist' && (
                  <div style={{ marginTop: "16px", backgroundColor: "#ffedd5", border: "1px solid #f97316", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <p style={{ color: "#c2410c", fontWeight: "600", margin: 0 }}>{t('⏳ את/ה ברשימת המתנה. נודיע לך אם יתפנה מקום.')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontWeight: "600" }}>{value}</div>
    </div>
  );
}