"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiActivities } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import styles from "./EditActivityPage.module.css";

const BRANCH_OPTIONS = [
  { value: "satria", label: "סניף סתריה" },
  { value: "nahalal", label: "סניף נהלל" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => (CURRENT_YEAR + i).toString());

export default function EditActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");
  const { t } = useIvrita();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    branch: "",
    location: "", 
    instructor: "",
    maxParticipants: "", 
    description: "",
    date: "", // YYYY-MM-DD
    startTime: "",
  });

  // Date UI State
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState(""); 

  // UI State
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);

  // Load Data
  useEffect(() => {
    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  const loadActivity = async () => {
    try {
      const [data, error] = await apiActivities.getById(activityId!);
      if (error) {
        alert("Error loading activity");
        router.back();
        return;
      }

      setFormData({
        title: data.title || "",
        branch: data.branch || "", 
        location: data.location || "",
        instructor: data.instructor || "",
        maxParticipants: data.max_participants ? data.max_participants.toString() : "",
        description: data.description || "",
        date: data.date || "",
        startTime: data.start_time || "",
      });

      if (data.date) {
        const [y, m, d] = data.date.split('-');
        setSelectedYear(y);
        setSelectedMonth(m);
        setSelectedDay(d);
      }

      if (data.image_url) {
        setImagePreviewUrl(data.image_url);
        const filename = data.image_url.split('/').pop() || "Existing Image";
        setImageName(filename);
      }

    } catch (error) {
      console.error("Error loading activity:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FLOATING LABEL FIX ---
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
    return () => window.removeEventListener("resize", updateLabelBackgrounds);
  }, [loading]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearField = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
  };

  const setFormValue = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (type: 'day' | 'month' | 'year', value: string) => {
    let d = selectedDay;
    let m = selectedMonth;
    let y = selectedYear;

    if (type === 'day') { setSelectedDay(value); d = value; setIsDayOpen(false); }
    if (type === 'month') { setSelectedMonth(value); m = value; setIsMonthOpen(false); }
    if (type === 'year') { setSelectedYear(value); y = value; setIsYearOpen(false); }

    if (d && m && y) {
      setFormData(prev => ({ ...prev, date: `${y}-${m}-${d}` }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageName(file.name);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImageName("");
    setImagePreviewUrl(null);
  };

  const handleSaveClick = () => {
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowModal(false);
    setSaving(true);

    try {
      const maxPart = formData.maxParticipants ? parseInt(formData.maxParticipants) : 0;
      let imageUrl = imagePreviewUrl; 
      if (imageFile) {
        const [url, error] = await apiActivities.uploadImage(imageFile);
        if (error) throw new Error("Image upload failed");
        imageUrl = url;
      }

      const fullDate = (selectedYear && selectedMonth && selectedDay) 
        ? `${selectedYear}-${selectedMonth}-${selectedDay}` 
        : formData.date;

      const updates = {
        title: formData.title,
        description: formData.description,
        branch: formData.branch,
        location: formData.location,
        max_participants: maxPart,
        instructor: formData.instructor,
        image_url: imageUrl,
        date: fullDate,
        start_time: formData.startTime,
      };

      const [_, error] = await apiActivities.update(activityId!, updates);
      if (error) throw new Error(error);

      router.back();
    } catch (error) {
      console.error("Error updating:", error);
      alert("שגיאה בעדכון הפעילות");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.pageOverride} style={{alignItems:'center', justifyContent:'center', color:'white'}}>טוען...</div>;

  return (
    <main className={`mobile-container ${styles.pageOverride}`}>
      
      <button className="close-button" onClick={() => router.back()}>
        <div className="close-button-inner" />
        <div className="close-icon" />
      </button>

      <div className={styles.header}>
        <h1 className={styles.headerTitle}>עריכת פעילות</h1>
      </div>

      <div className={styles.scrollContainer}>
        
        {/* Title */}
        <div className={styles.inputWrapper}>
          <input 
            type="text" name="title" value={formData.title} onChange={handleChange} className={styles.inputField} 
          />
          <label className={styles.inputLabel}>שם הפעילות</label>
          {formData.title && (
            <button className={styles.deleteIconBtn} onClick={() => handleClearField('title')}>
              <svg viewBox="0 0 10 10" fill="none"><path d="M3 3L7 7M7 3L3 7" stroke="#E74E1C" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>

        {/* Branch Dropdown - Updated Arrow */}
        <div className={`${styles.dropdownContainer} ${isBranchOpen ? styles.activeDropdownContainer : ''}`}>
          <div className={styles.inputWrapper}>
            <button type="button" onClick={() => setIsBranchOpen(!isBranchOpen)} className={`${styles.dropdownToggle} ${isBranchOpen ? styles.open : ''}`}>
              <span>{BRANCH_OPTIONS.find(o => o.value === formData.branch)?.label || "בחר/י"}</span>
              <span className={`${styles.dropdownArrow} ${isBranchOpen ? styles.open : ''}`}></span>
            </button>
            <label className={styles.inputLabel}>סניף</label>
          </div>
          {isBranchOpen && (
            <div className={styles.dropdownMenu}>
              {BRANCH_OPTIONS.map(opt => (
                <button key={opt.value} className={styles.dropdownOption} onClick={() => { setFormValue('branch', opt.value); setIsBranchOpen(false); }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className={styles.inputWrapper}>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className={styles.inputField} placeholder=" " />
          <label className={styles.inputLabel}>מיקום <span className={styles.optionalText}>*לא חובה</span></label>
          {formData.location && (
            <button className={styles.deleteIconBtn} onClick={() => handleClearField('location')}>
              <svg viewBox="0 0 10 10" fill="none"><path d="M3 3L7 7M7 3L3 7" stroke="#E74E1C" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>

        {/* Instructor */}
        <div className={styles.inputWrapper}>
          <input type="text" name="instructor" value={formData.instructor} onChange={handleChange} className={styles.inputField} />
          <label className={styles.inputLabel}>מנחה</label>
          {formData.instructor && (
            <button className={styles.deleteIconBtn} onClick={() => handleClearField('instructor')}>
              <svg viewBox="0 0 10 10" fill="none"><path d="M3 3L7 7M7 3L3 7" stroke="#E74E1C" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>

        {/* Max Participants */}
        <div className={styles.inputWrapper}>
          <input 
            type="number" 
            name="maxParticipants" 
            value={formData.maxParticipants} 
            onChange={handleChange} 
            className={styles.inputField}
            min="0"
          />
          <label className={styles.inputLabel}>מספר משתתפים מקסימלי</label>
          {formData.maxParticipants && (
            <button className={styles.deleteIconBtn} onClick={() => handleClearField('maxParticipants')}>
              <svg viewBox="0 0 10 10" fill="none"><path d="M3 3L7 7M7 3L3 7" stroke="#E74E1C" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>

        {/* Date Row - Updated Arrows */}
        <div className={styles.fieldGroup}>
          <div className={styles.dateLabel}>תאריך</div>
          <div className={styles.dateRow}>
            {/* YEAR */}
            <div className={`${styles.miniDropdownContainer} ${isYearOpen ? styles.activeMiniDropdown : ''}`}>
              <button type="button" onClick={() => setIsYearOpen(!isYearOpen)} className={`${styles.miniDropdownToggle} ${isYearOpen ? styles.open : ''}`}>
                <span>{selectedYear || "שנה"}</span>
                <span className={`${styles.dropdownArrow} ${isYearOpen ? styles.open : ''}`}></span>
              </button>
              {isYearOpen && (
                <div className={styles.miniDropdownMenu}>
                  {YEARS.map(y => (
                    <button key={y} className={styles.miniDropdownOption} onClick={() => handleDateChange('year', y)}>{y}</button>
                  ))}
                </div>
              )}
            </div>

            {/* MONTH */}
            <div className={`${styles.miniDropdownContainer} ${isMonthOpen ? styles.activeMiniDropdown : ''}`}>
              <button type="button" onClick={() => setIsMonthOpen(!isMonthOpen)} className={`${styles.miniDropdownToggle} ${isMonthOpen ? styles.open : ''}`}>
                <span>{selectedMonth || "חודש"}</span>
                <span className={`${styles.dropdownArrow} ${isMonthOpen ? styles.open : ''}`}></span>
              </button>
              {isMonthOpen && (
                <div className={styles.miniDropdownMenu}>
                  {MONTHS.map(m => (
                    <button key={m} className={styles.miniDropdownOption} onClick={() => handleDateChange('month', m)}>{m}</button>
                  ))}
                </div>
              )}
            </div>

            {/* DAY */}
            <div className={`${styles.miniDropdownContainer} ${isDayOpen ? styles.activeMiniDropdown : ''}`}>
              <button type="button" onClick={() => setIsDayOpen(!isDayOpen)} className={`${styles.miniDropdownToggle} ${isDayOpen ? styles.open : ''}`}>
                <span>{selectedDay || "יום"}</span>
                <span className={`${styles.dropdownArrow} ${isDayOpen ? styles.open : ''}`}></span>
              </button>
              {isDayOpen && (
                <div className={styles.miniDropdownMenu}>
                  {DAYS.map(d => (
                    <button key={d} className={styles.miniDropdownOption} onClick={() => handleDateChange('day', d)}>{d}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Row */}
        <div className={styles.fieldGroup}>
          <div className={styles.dateLabel}>שעה</div>
          <div className={styles.inputWrapper}>
              <input 
                type="time" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange} 
                className={`${styles.inputField} ${styles.timeInput}`} 
              />
          </div>
        </div>

        {/* Image Upload */}
        <div className={styles.inputWrapper}>
          <input type="file" id="editImageUpload" accept="image/*" onChange={handleImageChange} hidden />
          {imageName ? (
            <div className={styles.filePreviewBox}>
              <div style={{display:'flex', alignItems:'center', flex:1, overflow:'hidden'}}>
                  <span className={styles.fileName}>{imageName}</span>
              </div>
              <div style={{display:'flex', alignItems:'center'}}>
                  <span style={{width:'3px', height:'3px', background:'#fff', borderRadius:'50%'}}></span>
                  <span className={styles.previewLabel}>preview</span>
                  <button onClick={handleClearImage} style={{background:'none', border:'none', cursor:'pointer', padding:'0 5px', color:'#fff', fontSize:'1.2rem', lineHeight: '1'}}>✕</button>
              </div>
            </div>
          ) : (
            <label htmlFor="editImageUpload" className={styles.uploadBox}>
              <div className={styles.paperclipWrapper}>
                <svg className={styles.paperclipIcon} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.8131 7.87167L7.92063 14.7642C7.07624 15.6086 5.93102 16.0829 4.73688 16.0829C3.54274 16.0829 2.39751 15.6086 1.55313 14.7642C0.708744 13.9198 0.234375 12.7746 0.234375 11.5804C0.234375 10.3863 0.708744 9.24105 1.55313 8.39667L8.44563 1.50417C9.00855 0.941246 9.77204 0.625 10.5681 0.625C11.3642 0.625 12.1277 0.941246 12.6906 1.50417C13.2536 2.06709 13.5698 2.83058 13.5698 3.62667C13.5698 4.42276 13.2536 5.18625 12.6906 5.74917L5.79063 12.6417C5.50917 12.9231 5.12742 13.0813 4.72938 13.0813C4.33133 13.0813 3.94959 12.9231 3.66813 12.6417C3.38667 12.3602 3.22854 11.9785 3.22854 11.5804C3.22854 11.1824 3.38667 10.8006 3.66813 10.5192L10.0356 4.15917" stroke="#F9F9F9" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className={styles.uploadText}>לחץ/י כאן על מנת לבחור תמונה</span>
            </label>
          )}
          <label className={styles.inputLabel}>תמונה <span className={styles.optionalText}>*לא חובה</span></label>
        </div>

        {/* Description */}
        <div className={styles.inputWrapper}>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            className={`${styles.inputField} ${styles.descriptionArea}`} 
            rows={5}
          />
          <label className={styles.inputLabel}>תיאור</label>
          
          <div className={styles.saveButtonContainer}>
            <button onClick={handleSaveClick} disabled={saving} className={styles.saveButton}>
                {saving ? "שומר..." : "סיים עריכה"}
            </button>
          </div>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>האם תרצה לשלוח עדכון למשתתפים על השינויים שביצעת?</h3>
            <p className={styles.modalSubtitle}>העדכון ישלח לכל המשתתפים.</p>
            <div className={styles.modalButtons}>
              <button onClick={handleConfirmUpdate} className={styles.btnPrimary}>לשלוח עדכון</button>
              <button onClick={() => { setShowModal(false); /* Close only */ }} className={styles.btnOutline}>לא עכשיו</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}