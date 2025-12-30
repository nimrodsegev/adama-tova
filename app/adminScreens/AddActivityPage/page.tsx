"use client";
import { useState } from "react";
import { apiActivities } from "@/app/services/db_api";

type ActivityStatus = "open" | "closed" | "cancelled";
type ActivityCategory = "Art" | "Yoga" | "Meditation" | "Writing" | "Crafts" | "Mindfulness";

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

  // 👇 New State for Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
    setUploading(true); // Start loading

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
      image_url: imageUrl, // 👈 Save the URL
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
        setImageFile(null); // Reset file
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
    <main
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <header
        style={{
          marginBottom: "32px",
          backgroundColor: "transparent",
          padding: 0,
          border: "none",
        }}
      >
        <h1
          style={{ fontSize: "32px", marginBottom: "8px", textAlign: "right" }}
        >
          הוספת פעילות חדשה
        </h1>
        <p style={{ fontSize: "16px", color: "#666", textAlign: "right" }}>
          מלא את הפרטים להוספת פעילות למערכת
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            שם הפעילות *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
            }}
            placeholder="לדוגמה: סדנת ציור"
          />
        </div>

        {/* 👇 NEW IMAGE INPUT */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            תמונה לפעילות (אופציונלי)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImageFile(e.target.files[0]);
              }
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              backgroundColor: "white",
              textAlign: "right",
              direction: "rtl",
            }}
          />
          {imageFile && (
            <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
              קובץ נבחר: {imageFile.name}
            </div>
          )}
        </div>

        {/* Instructor */}
        <div>
          <label
            htmlFor="instructor"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            שם המנחה *
          </label>
          <input
            type="text"
            id="instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
            }}
            placeholder="לדוגמה: יוסי לוי"
          />
        </div>
        {/* Location */}
        <div>
          <label
            htmlFor="location"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            מיקום הפעילות *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
            }}
            placeholder="לדוגמה: במרחה החיצוני"
          />
        </div>
        {/* Date */}
        <div>
          <label
            htmlFor="date"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            תאריך *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
            }}
          />
        </div>

        {/* Start Time and End Time */}
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="start_time"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              שעת התחלה *
            </label>
            <input
              type="time"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #ccc",
                fontSize: "16px",
                textAlign: "right",
                direction: "rtl",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label
              htmlFor="end_time"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              שעת סיום *
            </label>
            <input
              type="time"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #ccc",
                fontSize: "16px",
                textAlign: "right",
                direction: "rtl",
              }}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            קטגוריה *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
              cursor: "pointer",
            }}
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
        <div>
          <label
            htmlFor="max_participants"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
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
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
            }}
            placeholder="לדוגמה: 20"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            סטטוס *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
              cursor: "pointer",
            }}
          >
            <option value="open">פנוי</option>
            <option value="closed">מלא</option>
            <option value="cancelled">בוטל</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            תיאור *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              textAlign: "right",
              direction: "rtl",
              resize: "vertical",
            }}
            placeholder="תאר את הפעילות..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || submitStatus === "success"}
          style={{
            padding: "16px",
            backgroundColor: submitStatus === "success" ? "#28a745" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: (uploading || submitStatus === "success") ? "not-allowed" : "pointer",
            transition: "background-color 0.3s",
            opacity: (uploading || submitStatus === "success") ? 0.7 : 1,
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
          <div
            style={{
              padding: "16px",
              backgroundColor: "#ffebee",
              border: "2px solid #f44336",
              borderRadius: "8px",
              textAlign: "center",
              color: "#c62828",
              fontWeight: "bold",
            }}
          >
            ❌ {errorMessage || "שגיאה בהוספת הפעילות. נסה שוב."}
          </div>
        )}

        {/* Success Message */}
        {submitStatus === "success" && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#e8f5e9",
              border: "2px solid #4caf50",
              borderRadius: "8px",
              textAlign: "center",
              color: "#2e7d32",
              fontWeight: "bold",
            }}
          >
            ✅ הפעילות נוספה בהצלחה!
          </div>
        )}
      </form>
    </main>
  );
}