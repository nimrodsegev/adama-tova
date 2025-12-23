"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiRegistrations } from "@/app/services/db_api";

export default function ActivityDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");

  // Get user info from context
  const { user, userProfile, loading: userLoading } = useUser();

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (activityId) {
      loadActivity();
      if (user) {
        checkRegistration();
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

  const checkRegistration = async () => {
    if (!user || !activityId) return;
    try {
      const [registrationIds, error] =
        await apiRegistrations.getUserRegistrationIds(user.id);
      if (!error && registrationIds) {
        const registered = (registrationIds as string[]).includes(activityId);
        setIsRegistered(registered);
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  // Check if user is admin
  const isAdmin = userProfile?.role === "admin";

  // ADMIN FUNCTIONS
  const handleEdit = () => {
    router.push(`/adminScreens/EditActivityPage?id=${activityId}`);
  };

  const handleDelete = async () => {
    if (!confirm("האם אתה בטוח שברצונך למחוק פעילות זו?")) return;

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

    if (isRegistered) {
      // ❌ CANCEL
      const [_, error] = await apiRegistrations.cancelRegistration(
        user.id,
        activityId!
      );
      if (error) {
        alert("שגיאה בביטול: " + error);
      } else {
        setIsRegistered(false);
        alert("ההרשמה בוטלה בהצלחה");
        // Reload activity to update participant count
        await loadActivity();
      }
    } else {
      // ✅ REGISTER
      const [res, error] = await apiRegistrations.registerUserToActivity(
        user.id,
        activityId!
      );
      if (error) {
        alert("שגיאה בהרשמה: " + error);
      } else {
        setIsRegistered(true);
        if (res?.message) alert(res.message);
        else alert("נרשמת בהצלחה לפעילות!");
        // Reload activity to update participant count
        await loadActivity();
      }
    }

    setProcessing(false);
  };

  if (loading || userLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "20px", color: "#666" }}>טוען...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "20px", color: "#666" }}>הפעילות לא נמצאה</div>
      </div>
    );
  }

  const spotsLeft =
    activity.max_participants - (activity.current_participants || 0);
  const isFull = spotsLeft <= 0;

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
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
              padding: "32px",
              color: "white",
            }}
          >
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              {activity.title}
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.9 }}>
              תיאור: {activity.description}
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: "32px" }}>
            {/* Quick Info - 6 boxes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📅</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  תאריך
                </div>
                <div style={{ fontWeight: "600" }}>
                  {new Date(activity.date).toLocaleDateString("he-IL")}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🕐</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  שעת התחלה
                </div>
                <div style={{ fontWeight: "600" }}>
                  {activity.start_time.slice(0, 5)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🕐</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  שעת סיום
                </div>
                <div style={{ fontWeight: "600" }}>
                  {activity.end_time.slice(0, 5)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📍</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  מיקום
                </div>
                <div style={{ fontWeight: "600" }}>{activity.location}</div>
              </div>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  משתתפים
                </div>
                <div style={{ fontWeight: "600" }}>
                  {activity.current_participants || 0}/
                  {activity.max_participants}
                </div>
              </div>
              {activity.instructor && (
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    👤
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    מדריך/ה
                  </div>
                  <div style={{ fontWeight: "600" }}>{activity.instructor}</div>
                </div>
              )}
            </div>

            {/* Status Badge */}
            {activity.status && (
              <div style={{ marginBottom: "32px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    backgroundColor:
                      activity.status === "active" ? "#d1fae5" : "#fee2e2",
                    color: activity.status === "active" ? "#065f46" : "#991b1b",
                  }}
                >
                  {activity.status === "open" ? "ניתן להירשם" : "הפעילות מלאה"}
                </span>
              </div>
            )}

            {/* Participants Info */}
            <div
              style={{
                backgroundColor: "#dbeafe",
                border: "1px solid #93c5fd",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#666" }}>זמינות</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {isFull ? "הפעילות מלאה" : `נותרו ${spotsLeft} מקומות`}
                  </div>
                </div>
                <div>
                  {isFull ? (
                    <span
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontWeight: "600",
                      }}
                    >
                      מלא
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: "#d1fae5",
                        color: "#065f46",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontWeight: "600",
                      }}
                    >
                      פתוח להרשמה
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS - Based on user role */}
            {isAdmin ? (
              // ADMIN BUTTONS
              <div style={{ display: "flex", gap: "16px" }}>
                <button
                  onClick={handleEdit}
                  disabled={processing}
                  style={{
                    flex: 1,
                    padding: "16px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    opacity: processing ? 0.7 : 1,
                  }}
                >
                  ✏️ ערוך פעילות
                </button>
                <button
                  onClick={handleDelete}
                  disabled={processing}
                  style={{
                    flex: 1,
                    padding: "16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    opacity: processing ? 0.7 : 1,
                  }}
                >
                  {processing ? "מוחק..." : "🗑️ מחק פעילות"}
                </button>
              </div>
            ) : (
              // USER BUTTONS
              <div>
                <button
                  onClick={handleToggleRegistration}
                  disabled={processing || (!isRegistered && isFull)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    backgroundColor: isRegistered
                      ? "#ef4444"
                      : isFull
                      ? "#9ca3af"
                      : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor:
                      processing || (!isRegistered && isFull)
                        ? "not-allowed"
                        : "pointer",
                    opacity: processing ? 0.7 : 1,
                  }}
                >
                  {processing
                    ? "מעדכן..."
                    : isRegistered
                    ? "❌ בטל הרשמה"
                    : isFull
                    ? "הפעילות מלאה"
                    : "✓ הרשם לפעילות"}
                </button>

                {/* Registration Status Indicator */}
                {isRegistered && !processing && (
                  <div
                    style={{
                      marginTop: "16px",
                      backgroundColor: "#d1fae5",
                      border: "1px solid #10b981",
                      borderRadius: "8px",
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{ color: "#065f46", fontWeight: "600", margin: 0 }}
                    >
                      ✓ אתה רשום לפעילות זו
                    </p>
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
