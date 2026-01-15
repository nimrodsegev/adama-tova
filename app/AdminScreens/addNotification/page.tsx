"use client";

import { useState, useEffect, useRef } from "react";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { useRouter } from "next/navigation";
import styles from "./addNotification.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import CutInput from '@/lib/components/UI/CutInput';

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

// --- SVG Path Generator (Dynamic Gap) ---
// Calculates the gap based on label length so the border doesn't cut text
const getSvgPath = (label: string) => {
  const charWidth = 9; // Tuned for Hebrew fonts
  const padding = 14; 
  const labelWidth = (label.length * charWidth) + padding;
  
  const totalWidth = 315;
  const radius = 9; 
  const rightGapStart = 315 - 32; // ~32px from right edge (matching CSS right: 2rem)
  const gapEnd = rightGapStart - labelWidth;

  // Draw the border with the calculated gap
  return `M${gapEnd} 0.5 H${radius} C0.5 0.5 0.5 4 0.5 8.5 V52 C0.5 56.5 4 59.5 ${radius} 59.5 H${totalWidth - radius} C${totalWidth - 4} 59.5 ${totalWidth - 0.5} 56.5 ${totalWidth - 0.5} 52 V8.5 C${totalWidth - 0.5} 4 ${totalWidth - 4} 0.5 ${totalWidth - radius} 0.5 H${rightGapStart}`;
};

export default function AddNotificationPage() {
  const router = useRouter();
  const { t } = useIvrita();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [mounting, setMounting] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Activities
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
        await apiActivities.notifyParticipants(selectedActivityId, title, message);
      } else if (targetType === "date") {
        if (!day || !month || !year) throw new Error("Please select a full date");
        const fullDate = `${year}-${month}-${day}`;
        await apiActivities.notifyByDate(fullDate, title, message);
      } else if (targetType === "circle") {
        if (!selectedCircle) throw new Error("Please select a circle");
        await apiActivities.notifyByCircle(selectedCircle, title, message);
      }
      alert("ההודעה נשלחה בהצלחה!");
      router.push("/AdminScreens/HomePage");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      alert("שגיאה בשליחת ההודעה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedActivityLabel = allActivities.find(a => a.id === selectedActivityId)?.title;
  const selectedCircleLabel = CIRCLE_OPTIONS.find(c => c.value === selectedCircle)?.label;
  const selectedTargetLabel = TARGET_OPTIONS.find(t => t.value === targetType)?.label;

  return (
    <SmoothPageWrapper isLoading={mounting}>
    <main className={`mobile-container ${styles.pageOverride}`}>
      <button className="close-button" onClick={() => router.back()}>
        <div className="close-button-inner" />
        <div className="close-icon" />
      </button>

      <div className={styles.header}>
        <h1 className={styles.headerTitle}>יצירת הודעה חדשה</h1>
      </div>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        
        {/* --- TARGET AUDIENCE DROPDOWN (SVG STYLE) --- */}
        <div className={`${styles.dropdownWrapperSVG} ${isTargetOpen ? styles.activeDropdownContainer : ''}`}>
          <svg className={styles.dropdownBorderSVG} viewBox="0 0 315 61" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d={getSvgPath("קהל יעד")} className={styles.dropdownBorderPath} strokeLinecap="round" />
          </svg>
          <span className={styles.dropdownLabelSVG}>קהל יעד</span>
          
          <button 
              type="button" 
              onClick={() => setIsTargetOpen(!isTargetOpen)} 
              className={`${styles.dropdownToggleSVG} ${isTargetOpen ? styles.open : ''}`}
          >
            <span className={!targetType ? styles.dropdownPlaceholder : ''}>
              {selectedTargetLabel || "בחר/י אפשרות"}
            </span>
            <span className={styles.arrowCSS}>▼</span>
          </button>
          
          {isTargetOpen && (
            <div className={styles.dropdownMenuSVG}>
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

        {/* 1. ACTIVITY SELECT (SVG STYLE) */}
        {targetType === "activity" && (
            <div className={`${styles.dropdownWrapperSVG} ${isActivityOpen ? styles.activeDropdownContainer : ''}`}>
                <svg className={styles.dropdownBorderSVG} viewBox="0 0 315 61" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d={getSvgPath("סדנא")} className={styles.dropdownBorderPath} strokeLinecap="round" />
                </svg>
                <span className={styles.dropdownLabelSVG}>סדנא</span>

                <button 
                    type="button" 
                    onClick={() => setIsActivityOpen(!isActivityOpen)} 
                    className={`${styles.dropdownToggleSVG} ${isActivityOpen ? styles.open : ''}`}
                >
                <span className={!selectedActivityId ? styles.dropdownPlaceholder : ''}>
                    {selectedActivityLabel || (loadingActivities ? "טוען..." : "בחר/י סדנא")}
                </span>
                <span className={styles.arrowCSS}>▼</span>
                </button>

                {isActivityOpen && !loadingActivities && (
                    <div className={styles.dropdownMenuSVG}>
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

        {/* 2. CIRCLE SELECT (SVG STYLE) */}
        {targetType === "circle" && (
            <div className={`${styles.dropdownWrapperSVG} ${isCircleOpen ? styles.activeDropdownContainer : ''}`}>
                <svg className={styles.dropdownBorderSVG} viewBox="0 0 315 61" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d={getSvgPath("מעגל")} className={styles.dropdownBorderPath} strokeLinecap="round" />
                </svg>
                <span className={styles.dropdownLabelSVG}>מעגל</span>

                <button 
                    type="button" 
                    onClick={() => setIsCircleOpen(!isCircleOpen)} 
                    className={`${styles.dropdownToggleSVG} ${isCircleOpen ? styles.open : ''}`}
                >
                <span className={!selectedCircle ? styles.dropdownPlaceholder : ''}>
                    {selectedCircleLabel || "בחר/י מעגל"}
                </span>
                <span className={styles.arrowCSS}>▼</span>
                </button>

                {isCircleOpen && (
                    <div className={styles.dropdownMenuSVG}>
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

        {/* 3. DATE SELECT (Mini Dropdowns) */}
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
        <CutInput
            label="כותרת ההודעה"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />      
        <CutInput
            label="תוכן ההודעה"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.cutInput}
            type="text"
            dir="rtl"
            textAlign="right"
        />    
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
    </SmoothPageWrapper>
  );
}