"use client";
import { useState } from "react";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import styles from "./AddActivityPage.styles";

type ActivityStatus = "open" | "closed" | "cancelled";
type ActivityCategory =
  | "Art"
  | "Yoga"
  | "Meditation"
  | "Writing"
  | "Crafts"
  | "Mindfulness";
type ActivityBranch = "satria" | "nahalal";
type GroupCircles = 
  |"Nova Survivor"
  |"October 7 victim"
  |"Shkulim parents"
  |"Shkulim Siblings"
  |"Family of october 7 victim"
  |"Rescue forces"
  |"Residence of Otef Aza"
  |"Second or third";

export default function AddActivityPage() {
  const { t } = useIvrita();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    status: "open" as ActivityStatus,
    category: "Art" as ActivityCategory,
    circle: "Nova Survivor" as GroupCircles,
    instructor: "",
    location: "",
    branch: "satria" as ActivityBranch,
    whatsapp_group_url: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // 👇 NEW STATE FOR GROUPS
  const [isGroup, setIsGroup] = useState(false);
  const [weeks, setWeeks] = useState(4); // Default to 4 weeks if group is selected
  const [requiresApproval, setRequiresApproval] = useState(false);

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
      category: isGroup ? null : formData.category,
      circle: isGroup ? formData.circle : null,
      instructor: formData.instructor,
      location: formData.location,
      image_url: imageUrl,
      branch: formData.branch,
      whatsapp_group_url: formData.whatsapp_group_url,
      is_group: isGroup,
      weeks: isGroup ? weeks : 1,
      requires_approval: requiresApproval, 
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
          circle: "Nova Survivor",
          instructor: "",
          location: "",
          branch: "satria" as ActivityBranch,
          whatsapp_group_url: "",
        });
        setImageFile(null);
        setIsGroup(false); // Reset Group toggle
        setWeeks(4);
        setRequiresApproval(false);
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
      <header style={styles.header}>
        <h1 style={styles.title}>הוספת פעילות חדשה</h1>
        <p style={styles.subtitle}>{t('מלא/י את הפרטים להוספת פעילות למערכת')}</p>
      </header>

      <div style={styles.scrollableContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Title */}
          <div style={styles.fieldContainer}>
            <label htmlFor="title" style={styles.label}>שם הפעילות *</label>
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

          {/* 👇 NEW GROUP TOGGLE SECTION */}
          <div style={{
            marginBottom: '20px', 
            padding: '15px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            backgroundColor: isGroup ? '#f0f9ff' : 'transparent',
            transition: 'all 0.3s ease'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
              <input 
                type="checkbox" 
                checked={isGroup} 
                onChange={(e) => {
                  setIsGroup(e.target.checked);
                  if (e.target.checked) setRequiresApproval(true); // Auto-check approval for groups
                }} 
                style={{ width: '20px', height: '20px' }}
              />
              זוהי קבוצה (סדרת מפגשים)
            </label>

            {isGroup && (
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontWeight: '500' }}>מספר מפגשים (שבועות):</label>
                  <input 
                    type="number" 
                    value={weeks} 
                    min="2"
                    onChange={(e) => setWeeks(Number(e.target.value))}
                    style={{ 
                      width: '80px', 
                      padding: '8px', 
                      borderRadius: '6px',
                      border: '1px solid #ccc' 
                    }}
                  />
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#4b5563' }}>
                  <input 
                    type="checkbox" 
                    checked={requiresApproval} 
                    onChange={(e) => setRequiresApproval(e.target.checked)} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  דורש אישור מנהל להרשמה (Pending Approval)
                </label>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>
                  * המערכת תיצור אוטומטית {weeks} מפגשים שבועיים החל מתאריך ההתחלה שתבחר למטה.
                </p>
              </div>
            )}
          </div>
          {/* 👆 END GROUP SECTION */}

          {/* Branch Selector */}
          <div style={styles.fieldContainer}>
            <label htmlFor="branch" style={styles.label}>סניף *</label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="satria">סתריה</option>
              <option value="nahalal">נהלל</option>
            </select>
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
            <label htmlFor="instructor" style={styles.label}>שם המנחה *</label>
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
            <label htmlFor="location" style={styles.label}>מיקום הפעילות *</label>
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
          <div style={styles.fieldContainer}>
            <label htmlFor="whatsapp_group_url" style={styles.label}>קישור לקבוצת וואטסאפ (אופציונלי)</label>
            <input
              type="url"
              id="whatsapp_group_url"
              name="whatsapp_group_url"
              value={formData.whatsapp_group_url}
              onChange={handleChange}
              style={styles.input}
              placeholder="https://chat.whatsapp.com/..."
              dir="ltr" // Force LTR for URL input
            />
          </div>
          {/* Date */}
          <div style={styles.fieldContainer}>
            <label htmlFor="date" style={styles.label}>
              {isGroup ? "תאריך מפגש ראשון *" : "תאריך *"}
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
              <label htmlFor="start_time" style={styles.label}>שעת התחלה *</label>
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
              <label htmlFor="end_time" style={styles.label}>שעת סיום *</label>
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

          {isGroup ? (
             //SHOW CIRCLE SELECTOR
             <div style={styles.fieldContainer}>
               <label htmlFor="circle" style={styles.label}>מעגל (Circle) *</label>
               <select
                 id="circle"
                 name="circle"
                 value={formData.circle}
                 onChange={handleChange}
                 required
                 style={styles.select}
               >
                 <option value="Nova Survivor">שורדי ושורדות המסיבות</option>
                 <option value="October 7 victim">נפגעי טראומה 7.10 ומלחמת חרבות ברזל</option>
                 <option value="Shkulim parents">הורים שכולים</option>
                 <option value="Shkulim Siblings">אחים.ות שכולים</option>
                 <option value="Family of october 7 victim">משפחות וקרובים של פצועים טראומה בגופם ובנפשם</option>
                 <option value="Rescue forces">כוחות הצלה וחילוץ</option>
                 <option value="Residence of Otef Aza">תושבי העוטף ומפונים</option>
                 <option value="Second or third">מעגל שני או שלישי של משפחת השכול</option>
               </select>
             </div>
          ) : (
             // SHOW CATEGORY SELECTOR
             <div style={styles.fieldContainer}>
               <label htmlFor="category" style={styles.label}>קטגוריה *</label>
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
          )}

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
            <label htmlFor="status" style={styles.label}>סטטוס *</label>
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
            <label htmlFor="description" style={styles.label}>תיאור *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              style={styles.textarea}
              placeholder={t("תאר/י את הפעילות...")}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || submitStatus === "success"}
            style={{
              ...styles.submitButton,
              backgroundColor: submitStatus === "success" ? "#28a745" : "#0070f3",
              opacity: uploading || submitStatus === "success" ? 0.7 : 1,
              cursor: uploading || submitStatus === "success" ? "not-allowed" : "pointer",
            }}
          >v
            {uploading
              ? "מעלה תמונה..."
              : submitStatus === "success"
              ? "✓ הפעילות נוספה"
              : "הוסף פעילות"}
          </button>

          {submitStatus === "error" && (
            <div style={styles.errorMessage}>
              ❌ {errorMessage || "שגיאה בהוספת הפעילות. נסה שוב."}
            </div>
          )}

          {submitStatus === "success" && (
            <div style={styles.successMessage}>✅ הפעילות נוספה בהצלחה!</div>
          )}
        </form>
      </div>
    </main>
  );
}