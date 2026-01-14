"use client";

import { useState, useEffect } from "react";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";

export default function AddNotificationPage() {
  const router = useRouter();
  const { t } = useIvrita();

  // Form State
  const [targetType, setTargetType] = useState<
    "" | "activity" | "date" | "circle"
  >("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCircle, setSelectedCircle] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // Data State
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [issubmitting, setIsSubmitting] = useState(false);

  // Mapping Hebrew display to English Enums
  const circleOptions = [
    { label: "שורדי נובה", value: "Nova Survivor" },
    { label: "נפגעי ה-7 באוקטובר", value: "October 7 victim" },
    { label: "הורים שכולים", value: "Shkulim parents" },
    { label: "אחים שכולים", value: "Shkulim Siblings" },
    { label: "משפחות נפגעי ה-7 באוקטובר", value: "Family of october 7 victim" },
    { label: "כוחות הצלה", value: "Rescue forces" },
    { label: "תושבי עוטף עזה", value: "Residence of Otef Aza" },
    { label: "מעגל שני או שלישי", value: "Second or third" },
  ];

  useEffect(() => {
    if (targetType === "activity" && allActivities.length === 0) {
      const fetchActivities = async () => {
        setLoadingActivities(true);
        const [data, error] = await apiActivities.getAll();
        if (!error && data) setAllActivities(data);
        setLoadingActivities(false);
      };
      fetchActivities();
    }
  }, [targetType, allActivities.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (targetType === "activity") {
        const [res, error] = await apiActivities.notifyParticipants(
          selectedActivityId,
          title,
          message
        );
        if (error) throw error;
      } else if (targetType === "date") {
        const [res, error] = await apiActivities.notifyByDate(
          selectedDate,
          title,
          message
        );
        if (error) {
          if (error.includes("No activities found")) {
            alert("לא נמצאו פעילויות בתאריך שנבחר");
            setIsSubmitting(false);
            return;
          }
          throw error;
        }
      } else if (targetType === "circle") {
        // New logic for Circle notification
        const [res, error] = await apiActivities.notifyByCircle(
          selectedCircle,
          title,
          message
        );
        if (error) throw error;
      }

      alert("ההודעה נשלחה בהצלחה!");
      router.push("/AdminScreens/HomePage");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("שגיאה בשליחת ההודעה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        יצירת הודעה חדשה
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Target Audience Selection */}
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            {t("בחר/י קהל יעד:")}
          </label>
          <select
            required
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as any)}
            style={styles.input}
          >
            <option value="">{t("-- בחר/י אפשרות --")}</option>
            <option value="activity">לפי פעילות</option>
            <option value="date">לפי תאריך</option>
            <option value="circle">לפי מעגל</option>
          </select>
        </div>

        {/* Conditional Field: Circle Selection */}
        {targetType === "circle" && (
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              {t("בחר/י מעגל:")}
            </label>
            <select
              required
              value={selectedCircle}
              onChange={(e) => setSelectedCircle(e.target.value)}
              style={styles.input}
            >
              <option value="">{t("-- בחר/י מעגל מהרשימה --")}</option>
              {circleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Conditional Field: Activity List */}
        {targetType === "activity" && (
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              {t("בחר/י סדנא:")}
            </label>
            {loadingActivities ? (
              <p>טוען סדנאות...</p>
            ) : (
              <select
                required
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                style={styles.input}
              >
                <option value="">{t("-- בחר/י סדנא מהרשימה --")}</option>
                {allActivities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} | {act.date} | {act.start_time?.slice(0, 5)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Conditional Field: Date Picker */}
        {targetType === "date" && (
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              {t("בחר/י תאריך:")}
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.input}
            />
          </div>
        )}

        <hr />

        {/* Message Content */}
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            כותרת ההודעה:
          </label>
          <input
            type="text"
            required
            placeholder={t("[הכנס|הכניסי] כותרת...")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            טקסט ההודעה:
          </label>
          <textarea
            required
            rows={5}
            placeholder={t("[כתוב|כתבי] את תוכן ההודעה כאן...")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ ...styles.input, resize: "none" }}
          />
        </div>

        <button
          type="submit"
          disabled={issubmitting || !targetType}
          style={{
            ...styles.submitBtn,
            backgroundColor: issubmitting ? "#9ca3af" : "#10b981",
          }}
        >
          {issubmitting ? "שולח..." : t("שלח/י הודעה לקהל היעד")}
        </button>
      </form>
    </main>
  );
}

const styles = {
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  submitBtn: {
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold" as const,
    cursor: "pointer",
  },
};
