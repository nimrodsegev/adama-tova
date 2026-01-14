"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import styles from "./addNotification.module.css";

// --- Options ---
const TARGET_OPTIONS = [
  { label: "לפי פעילות", value: "activity" },
  { label: "לפי תאריך", value: "date" },
  { label: "לפי מעגל", value: "circle" },
];

const CIRCLE_OPTIONS = [
  { label: "שורדי נובה", value: "Nova Survivor" },
  { label: "נפגעי ה-7 באוקטובר", value: "October 7 victim" },
  { label: "הורים שכולים", value: "Shkulim parents" },
  { label: "אחים שכולים", value: "Shkulim Siblings" },
  { label: "משפחות נפגעי ה-7 באוקטובר", value: "Family of october 7 victim" },
  { label: "כוחות הצלה", value: "Rescue forces" },
  { label: "תושבי עוטף עזה", value: "Residence of Otef Aza" },
  { label: "מעגל שני או שלישי", value: "Second or third" },
];

// --- Date Helpers ---
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => (CURRENT_YEAR + i).toString());

export default function AddNotificationPage() {
  const router = useRouter();
  const { t } = useIvrita();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [targetType, setTargetType] = useState<"" | "activity" | "date" | "circle">("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedCircle, setSelectedCircle] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // Date State
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // UI State (Dropdowns)
  const [isTargetOpen, setIsTargetOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isCircleOpen, setIsCircleOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);

  // Data State
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FLOATING LABEL BACKGROUND FIX ---
  useLayoutEffect(() => {
    const updateLabelBackgrounds = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      const labels = document.querySelectorAll(`.${styles.inputLabel}`) as NodeListOf<HTMLElement>;
      labels.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--bg-y", `${-rect.top}px`);
      });
    };
    updateLabelBackgrounds();
    window.addEventListener("resize", updateLabelBackgrounds);
    if (scrollContainerRef.current) {
        scrollContainerRef.current.addEventListener("scroll", updateLabelBackgrounds);
    }
    return () => {
        window.removeEventListener("resize", updateLabelBackgrounds);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.removeEventListener("scroll", updateLabelBackgrounds);
        }
    };
  }, [targetType, allActivities]);

  // Fetch Activities when target type changes
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (targetType === "activity") {
        if (!selectedActivityId) throw new Error("Please select an activity");
        const [res, error] = await apiActivities.notifyParticipants(
          selectedActivityId,
          title,
          message
        );
        if (error) throw error;
      } else if (targetType === "date") {
        if (!day || !month || !year) throw new Error("Please select a full date");
        const fullDate = `${year}-${month}-${day}`;
        const [res, error] = await apiActivities.notifyByDate(
          fullDate,
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
        if (!selectedCircle) throw new Error("Please select a circle");
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
      alert("שגיאה בשליחת ההודעה: חסרים פרטים או אירעה תקלה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedActivityLabel = allActivities.find(a => a.id === selectedActivityId)?.title;
  const selectedCircleLabel = CIRCLE_OPTIONS.find(c => c.value === selectedCircle)?.label;
  const selectedTargetLabel = TARGET_OPTIONS.find(t => t.value === targetType)?.label;

  return (
    <main className={`mobile-container ${styles.pageOverride}`}>
      <button className="close-button" onClick={() => router.back()}>
        <div className="close-button-inner" />
        <div className="close-icon" />
      </button>

      <div className={styles.header}>
        <h1 className={styles.headerTitle}>יצירת הודעה חדשה</h1>
      </div>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        
        {/* --- TARGET AUDIENCE DROPDOWN --- */}
        <div className={`${styles.dropdownContainer} ${isTargetOpen ? styles.activeDropdownContainer : ''}`}>
          <div className={styles.inputWrapper}>
            <button 
                type="button" 
                onClick={() => setIsTargetOpen(!isTargetOpen)} 
                className={`${styles.dropdownToggle} ${isTargetOpen ? styles.open : ''}`}
            >
              <span className={!targetType ? styles.dropdownPlaceholder : ''}>
                {selectedTargetLabel || "בחר/י אפשרות"}
              </span>
              <div className={styles.arrowIconWrapper}>
                <svg width="18" height="8" viewBox="0 0 18 8" fill="none"><path d="M0.500067 0.5L8.53964 6.53906L16.5792 0.5" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </button>
            <label className={styles.inputLabel}>קהל יעד</label>
          </div>
          {isTargetOpen && (
            <div className={styles.dropdownMenu}>
              {TARGET_OPTIONS.map(opt => (
                <button 
                    key={opt.value} 
                    type="button" 
                    onClick={() => { setTargetType(opt.value as any); setIsTargetOpen(false); }} 
                    className={`${styles.dropdownOption} ${targetType === opt.value ? styles.selected : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- CONDITIONAL FIELDS --- */}

        {/* 1. ACTIVITY SELECT */}
        {targetType === "activity" && (
            <div className={`${styles.dropdownContainer} ${isActivityOpen ? styles.activeDropdownContainer : ''}`}>
                <div className={styles.inputWrapper}>
                    <button 
                        type="button" 
                        onClick={() => setIsActivityOpen(!isActivityOpen)} 
                        className={`${styles.dropdownToggle} ${isActivityOpen ? styles.open : ''}`}
                    >
                    <span className={!selectedActivityId ? styles.dropdownPlaceholder : ''}>
                        {selectedActivityLabel || (loadingActivities ? "טוען..." : "בחר/י סדנא")}
                    </span>
                    <div className={styles.arrowIconWrapper}>
                        <svg width="18" height="8" viewBox="0 0 18 8" fill="none"><path d="M0.500067 0.5L8.53964 6.53906L16.5792 0.5" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    </button>
                    <label className={styles.inputLabel}>סדנא</label>
                </div>
                {isActivityOpen && !loadingActivities && (
                    <div className={styles.dropdownMenu}>
                    {allActivities.map(act => (
                        <button 
                            key={act.id} 
                            type="button" 
                            onClick={() => { setSelectedActivityId(act.id); setIsActivityOpen(false); }} 
                            className={`${styles.dropdownOption} ${selectedActivityId === act.id ? styles.selected : ''}`}
                        >
                        {act.title} ({act.date})
                        </button>
                    ))}
                    </div>
                )}
            </div>
        )}

        {/* 2. CIRCLE SELECT */}
        {targetType === "circle" && (
            <div className={`${styles.dropdownContainer} ${isCircleOpen ? styles.activeDropdownContainer : ''}`}>
                <div className={styles.inputWrapper}>
                    <button 
                        type="button" 
                        onClick={() => setIsCircleOpen(!isCircleOpen)} 
                        className={`${styles.dropdownToggle} ${isCircleOpen ? styles.open : ''}`}
                    >
                    <span className={!selectedCircle ? styles.dropdownPlaceholder : ''}>
                        {selectedCircleLabel || "בחר/י מעגל"}
                    </span>
                    <div className={styles.arrowIconWrapper}>
                        <svg width="18" height="8" viewBox="0 0 18 8" fill="none"><path d="M0.500067 0.5L8.53964 6.53906L16.5792 0.5" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    </button>
                    <label className={styles.inputLabel}>מעגל</label>
                </div>
                {isCircleOpen && (
                    <div className={styles.dropdownMenu}>
                    {CIRCLE_OPTIONS.map(opt => (
                        <button 
                            key={opt.value} 
                            type="button" 
                            onClick={() => { setSelectedCircle(opt.value); setIsCircleOpen(false); }} 
                            className={`${styles.dropdownOption} ${selectedCircle === opt.value ? styles.selected : ''}`}
                        >
                        {opt.label}
                        </button>
                    ))}
                    </div>
                )}
            </div>
        )}

        {/* 3. DATE SELECT (3 Small Dropdowns) */}
        {targetType === "date" && (
            <div className={styles.fieldGroup}>
                <label className={styles.dateLabel}>תאריך</label>
                <div className={styles.dateRow}>
                    {/* YEAR */}
                    <div className={`${styles.miniDropdownContainer} ${isYearOpen ? styles.activeMiniDropdown : ''}`}>
                        <button type="button" onClick={() => setIsYearOpen(!isYearOpen)} className={`${styles.miniDropdownToggle} ${isYearOpen ? styles.open : ''}`}>
                            <span>{year || "שנה"}</span>
                            <div className={styles.arrowIconWrapper} style={{transform: isYearOpen ? 'rotate(180deg)' : 'scale(0.8)'}}>
                                <svg width="18" height="8" viewBox="0 0 18 8" fill="none"><path d="M0.500067 0.5L8.53964 6.53906L16.5792 0.5" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </button>
                        {isYearOpen && (
                            <div className={styles.miniDropdownMenu}>
                                {YEARS.map(y => (
                                    <button key={y} className={styles.miniDropdownOption} onClick={() => { setYear(y); setIsYearOpen(false); }}>{y}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* MONTH */}
                    <div className={`${styles.miniDropdownContainer} ${isMonthOpen ? styles.activeMiniDropdown : ''}`}>
                        <button type="button" onClick={() => setIsMonthOpen(!isMonthOpen)} className={`${styles.miniDropdownToggle} ${isMonthOpen ? styles.open : ''}`}>
                            <span>{month || "חודש"}</span>
                            <div className={styles.arrowIconWrapper} style={{transform: isMonthOpen ? 'rotate(180deg)' : 'scale(0.8)'}}>
                                <svg width="18" height="8" viewBox="0 0 18 8" fill="none"><path d="M0.500067 0.5L8.53964 6.53906L16.5792 0.5" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </button>
                        {isMonthOpen && (
                            <div className={styles.miniDropdownMenu}>
                                {MONTHS.map(m => (
                                    <button key={m} className={styles.miniDropdownOption} onClick={() => { setMonth(m); setIsMonthOpen(false); }}>{m}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DAY */}
                    <div className={`${styles.miniDropdownContainer} ${isDayOpen ? styles.activeMiniDropdown : ''}`}>
                        <button type="button" onClick={() => setIsDayOpen(!isDayOpen)} className={`${styles.miniDropdownToggle} ${isDayOpen ? styles.open : ''}`}>
                            <span>{day || "יום"}</span>
                            <div className={styles.arrowIconWrapper} style={{transform: isDayOpen ? 'rotate(180deg)' : 'scale(0.8)'}}>
                                <svg width="18" height="8" viewBox="0 0 18 8" fill="none"><path d="M0.500067 0.5L8.53964 6.53906L16.5792 0.5" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </button>
                        {isDayOpen && (
                            <div className={styles.miniDropdownMenu}>
                                {DAYS.map(d => (
                                    <button key={d} className={styles.miniDropdownOption} onClick={() => { setDay(d); setIsDayOpen(false); }}>{d}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- COMMON FIELDS --- */}
        <div className={styles.inputWrapper}>
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className={styles.inputField} 
                placeholder=" "
            />
            <label className={styles.inputLabel}>כותרת ההודעה</label>
        </div>

        <div className={styles.inputWrapper}>
            <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className={`${styles.inputField} ${styles.textarea}`} 
                placeholder=" "
            />
            <label className={styles.inputLabel}>תוכן ההודעה</label>
        </div>

        <div className={styles.buttonContainer}>
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !targetType || !title || !message} 
                className={styles.submitButton}
            >
                {isSubmitting ? "שולח..." : "שלח הודעה"}
            </button>
        </div>

      </div>
    </main>
  );
}