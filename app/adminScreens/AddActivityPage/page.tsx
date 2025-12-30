"use client";
import { useState } from "react";
import { apiActivities } from "@/app/services/db_api";
import styles from "./AddActivityPage.styles";

type ActivityStatus = "open" | "closed" | "cancelled";
type ActivityCategory =
  | "Art"
  | "Yoga"
  | "Meditation"
  | "Writing"
  | "Crafts"
  | "Mindfulness";

export default function AddActivityPage() {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    status: "open" as ActivityStatus,
    category: "Art" as ActivityCategory,
    instructor: "",
    location: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ FIXED: Correct type definition using union (|) instead of commas
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    setErrorMessage("");
    setUploading(true);

    let imageUrl = null;

    // 1. Upload Image (If selected)
    if (imageFile) {
      const [url, error] = await apiActivities.uploadImage(imageFile);
      if (error) {
        console.error("Image upload failed:", error);
        setErrorMessage("שגיאה בהעלאת התמונה: " + error);
        setSubmitStatus("error");
        setUploading(false);
        return;
      }
      imageUrl = url;
    }

    // 2. Create Activity Object
    const activityObject = {
      title: formData.title,
      date: formData.date,
      description: formData.description,
      start_time: formData.start_time,
      end_time: formData.end_time,
      max_participants: parseInt(formData.max_participants),
      status: formData.status,
      category: formData.category,
      instructor: formData.instructor,
      location: formData.location,
      image_url: imageUrl,
    };

    try {
      const [data, error] = await apiActivities.createActivity(activityObject);

      if (error) {
        console.error("Error adding activity:", error);
        setErrorMessage(error);
        setSubmitStatus("error");
        setUploading(false);
        return;
      }

      console.log("Activity created successfully:", data);
      setSubmitStatus("success");

      // Reset form
      setTimeout(() => {
        setFormData({
          title: "",
          date: "",
          description: "",
          start_time: "",
          end_time: "",
          max_participants: "",
          status: "open",
          category: "Art",
          instructor: "",
          location: "",
        });
        setImageFile(null);
        setSubmitStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("שגיאה בלתי צפויה");
      setSubmitStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={styles.mainContainer}>
      {/* Header - Fixed at top */}
      <header style={styles.header}>
        <h1 style={styles.title}>הוספת פעילות חדשה</h1>
        <p style={styles.subtitle}>מלא את הפרטים להוספת פעילות למערכת</p>
      </header>

      {/* Scrollable form container */}
      <div style={styles.scrollableContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.fieldContainer}>
            <label htmlFor="title" style={styles.label}>
              שם הפעילות *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="לדוגמה: סדנת ציור"
            />
          </div>

          {/* Image Input */}
          <div style={styles.fieldContainer}>
            <label style={styles.label}>תמונה לפעילות (אופציונלי)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              style={styles.fileInput}
            />
            {imageFile && (
              <div style={styles.fileNameDisplay}>
                קובץ נבחר: {imageFile.name}
              </div>
            )}
          </div>

          {/* Instructor */}
          <div style={styles.fieldContainer}>
            <label htmlFor="instructor" style={styles.label}>
              שם המנחה *
            </label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="לדוגמה: יוסי לוי"
            />
          </div>

          {/* Location */}
          <div style={styles.fieldContainer}>
            <label htmlFor="location" style={styles.label}>
              מיקום הפעילות *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="לדוגמה: במרחה החיצוני"
            />
          </div>

          {/* Date */}
          <div style={styles.fieldContainer}>
            <label htmlFor="date" style={styles.label}>
              תאריך *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Start Time and End Time */}
          <div style={styles.timeRow}>
            <div style={styles.timeField}>
              <label htmlFor="start_time" style={styles.label}>
                שעת התחלה *
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.timeField}>
              <label htmlFor="end_time" style={styles.label}>
                שעת סיום *
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Category */}
          <div style={styles.fieldContainer}>
            <label htmlFor="category" style={styles.label}>
              קטגוריה *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="Art">אמנות</option>
              <option value="Yoga">יוגה</option>
              <option value="Meditation">מדיטציה</option>
              <option value="Writing">כתיבה</option>
              <option value="Crafts">יצירה</option>
              <option value="Mindfulness">מיידנפולנס</option>
            </select>
          </div>

          {/* Max Participants */}
          <div style={styles.fieldContainer}>
            <label htmlFor="max_participants" style={styles.label}>
              מספר משתתפים מקסימלי *
            </label>
            <input
              type="number"
              id="max_participants"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              required
              min="1"
              style={styles.input}
              placeholder="לדוגמה: 20"
            />
          </div>

          {/* Status */}
          <div style={styles.fieldContainer}>
            <label htmlFor="status" style={styles.label}>
              סטטוס *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="open">פנוי</option>
              <option value="closed">מלא</option>
              <option value="cancelled">בוטל</option>
            </select>
          </div>

          {/* Description */}
          <div style={styles.fieldContainer}>
            <label htmlFor="description" style={styles.label}>
              תיאור *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              style={styles.textarea}
              placeholder="תאר את הפעילות..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || submitStatus === "success"}
            style={{
              ...styles.submitButton,
              backgroundColor:
                submitStatus === "success" ? "#28a745" : "#0070f3",
              opacity: uploading || submitStatus === "success" ? 0.7 : 1,
              cursor:
                uploading || submitStatus === "success"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {uploading
              ? "מעלה תמונה..."
              : submitStatus === "success"
              ? "✓ הפעילות נוספה"
              : "הוסף פעילות"}
          </button>

          {/* Error Message */}
          {submitStatus === "error" && (
            <div style={styles.errorMessage}>
              ❌ {errorMessage || "שגיאה בהוספת הפעילות. נסה שוב."}
            </div>
          )}

          {/* Success Message */}
          {submitStatus === "success" && (
            <div style={styles.successMessage}>✅ הפעילות נוספה בהצלחה!</div>
          )}
        </form>
      </div>
    </main>
  );
}
